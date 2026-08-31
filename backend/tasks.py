import os
import csv
import json
import urllib.request
from datetime import date, datetime, timedelta
from celery_worker import celery_app


@celery_app.task(name='tasks.send_appointment_reminders')
def send_appointment_reminders():
    """Send reminders for appointments in the next few hours"""
    from app import create_app
    from utils.notifications import send_sms, send_whatsapp
    
    app = create_app()
    with app.app_context():
        from models import Booking
        from config import Config
        
        hours_before = Config.REMINDER_HOURS_BEFORE
        now = datetime.now()
        target_time = now + timedelta(hours=hours_before)
        target_date = target_time.date()
        
        bookings = Booking.query.filter_by(date=target_date).filter(
            Booking.status.in_(['pending', 'approved'])
        ).all()
        
        sent_count = 0
        for booking in bookings:
            try:
                appointment_time = datetime.strptime(booking.time, '%I:%M %p').time()
                appointment_datetime = datetime.combine(booking.date, appointment_time)
                time_diff = (appointment_datetime - now).total_seconds() / 3600
                
                if 0 < time_diff <= hours_before + 1:
                    patient = booking.client
                    doctor = booking.physician
                    phone = patient.account.contact
                    
                    message = (
                        f"Reminder: You have an appointment with Dr. {doctor.account.full_name} "
                        f"({doctor.expertise}) on {booking.date.strftime('%B %d, %Y')} at {booking.time}. "
                        f"Location: MediCore Hospital. Please arrive 10 minutes early."
                    )
                    
                    print(f'[REMINDER] Appointment reminder for {patient.account.full_name}: {message}')
                    
                    # SMS/WhatsApp sending (optional - only if Twilio is configured)
                    if phone:
                        if send_sms(phone, message):
                            sent_count += 1
                        if send_whatsapp(phone, message):
                            sent_count += 1
                        
            except Exception as e:
                print(f'[REMINDER] Error processing booking {booking.id}: {e}')
        
        return f'Processed {len(bookings)} appointments, sent {sent_count} notifications'


@celery_app.task(name='tasks.send_daily_reminders')
def send_daily_reminders():
    from app import create_app
    app = create_app()
    with app.app_context():
        from models import Booking
        today = date.today()
        bookings = Booking.query.filter_by(date=today).filter(
            Booking.status.in_(['pending', 'approved'])
        ).all()

        messages = []
        for b in bookings:
            msg = (
                f"Reminder: {b.client.account.full_name} has a visit with "
                f"Dr. {b.physician.account.full_name} today at {b.time}."
            )
            messages.append(msg)
            print(f'[REMINDER] {msg}')

        webhook_url = os.environ.get('GOOGLE_CHAT_WEBHOOK_URL', '')
        if webhook_url and messages:
            text = '\n'.join(messages)
            payload = json.dumps({'text': f'Daily Visit Reminders:\n{text}'})
            req = urllib.request.Request(
                webhook_url,
                data=payload.encode('utf-8'),
                headers={'Content-Type': 'application/json'},
            )
            try:
                urllib.request.urlopen(req)
            except Exception as e:
                print(f'[REMINDER] Webhook error: {e}')

        return f'Sent {len(messages)} reminders'


@celery_app.task(name='tasks.generate_monthly_report')
def generate_monthly_report():
    from app import create_app
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.mime.application import MIMEApplication

    app = create_app()
    with app.app_context():
        from models import Physician, Booking, CaseNote
        today = date.today()
        month_start = today.replace(day=1)

        reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
        os.makedirs(reports_dir, exist_ok=True)

        # 1. Setup Email Configuration (Read from environment variables)
        SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
        SMTP_USER = os.environ.get('SMTP_USER', '') # e.g., your_email@gmail.com
        SMTP_PASS = os.environ.get('SMTP_PASS', '') # e.g., your App Password
        
        physicians = Physician.query.all()
        emails_sent = 0

        for phy in physicians:
            bookings = Booking.query.filter(
                Booking.physician_id == phy.id,
                Booking.date >= month_start,
                Booking.date <= today,
            ).all()
            notes = CaseNote.query.filter(
                CaseNote.physician_id == phy.id,
                CaseNote.date >= month_start,
                CaseNote.date <= today,
            ).all()

            booking_rows = ''.join(
                f'<tr><td>{b.date}</td><td>{b.client.account.full_name}</td>'
                f'<td>{b.time}</td><td>{b.status}</td></tr>'
                for b in bookings
            )
            note_rows = ''.join(
                f'<tr><td>{n.date}</td><td>{n.client.account.full_name}</td>'
                f'<td>{n.condition or ""}</td></tr>'
                for n in notes
            )

            html = f"""<!DOCTYPE html>
<html><head><style>
  body {{ font-family: Arial, sans-serif; padding: 2rem; }}
  h1 {{ color: #059669; }} h2 {{ color: #047857; }}
  table {{ border-collapse: collapse; width: 100%; margin-bottom: 2rem; }}
  th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
  th {{ background: #f0fdf4; }}
</style></head><body>
<h1>Monthly Report — Dr. {phy.account.full_name}</h1>
<p>Period: {month_start} to {today} | Expertise: {phy.expertise}</p>
<h2>Visits ({len(bookings)} total)</h2>
<table><tr><th>Date</th><th>Client</th><th>Time</th><th>Status</th></tr>{booking_rows}</table>
<h2>Case Notes ({len(notes)} total)</h2>
<table><tr><th>Date</th><th>Client</th><th>Condition</th></tr>{note_rows}</table>
</body></html>"""

            # Save the file locally
            fname = f"report_phy{phy.id}_{today.strftime('%Y_%m')}.html"
            filepath = os.path.join(reports_dir, fname)
            with open(filepath, 'w') as f:
                f.write(html)
            print(f'[REPORT] Generated: {fname}')

            # 2. Email Sending Logic
            phy_email = phy.account.email if phy.account and phy.account.email else None

            if phy_email and SMTP_USER and SMTP_PASS:
                try:
                    msg = MIMEMultipart()
                    msg['From'] = SMTP_USER
                    msg['To'] = phy_email
                    msg['Subject'] = f"Monthly Activity Report - {today.strftime('%B %Y')}"

                    # Attach HTML content as the email body
                    msg.attach(MIMEText(html, 'html'))

                    # Optional: Attach the HTML file as an actual attachment
                    with open(filepath, 'rb') as f:
                        part = MIMEApplication(f.read(), Name=fname)
                    part['Content-Disposition'] = f'attachment; filename="{fname}"'
                    msg.attach(part)

                    # Send the email
                    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                        server.starttls()
                        server.login(SMTP_USER, SMTP_PASS)
                        server.send_message(msg)

                    print(f'[REPORT] Successfully emailed to: {phy_email}')
                    emails_sent += 1
                except Exception as e:
                    print(f'[REPORT] Failed to email Dr. {phy.account.full_name}: {e}')

        return f'Generated reports for {len(physicians)} physicians. Sent {emails_sent} emails.'
@celery_app.task(name='tasks.export_client_csv_task')
def export_client_csv_task(client_id):
    from app import create_app
    app = create_app()
    with app.app_context():
        from models import Client, CaseNote
        client = Client.query.get(client_id)
        if not client:
            return {'error': 'Client not found'}

        exports_dir = os.path.join(os.path.dirname(__file__), 'exports')
        os.makedirs(exports_dir, exist_ok=True)

        fname = f"client_{client_id}_notes_{date.today().strftime('%Y%m%d')}.csv"
        fpath = os.path.join(exports_dir, fname)
        notes = CaseNote.query.filter_by(client_id=client_id).all()

        with open(fpath, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Date', 'Physician', 'Condition', 'Treatment', 'Remarks'])
            for n in notes:
                writer.writerow([
                    str(n.date),
                    n.physician.account.full_name,
                    n.condition or '',
                    n.treatment or '',
                    n.remarks or '',
                ])

        return {'filename': fname, 'download_url': f'/exports/{fname}', 'records': len(notes)}
