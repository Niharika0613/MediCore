from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Physician, Client, Booking, CaseNote, Account
from utils.decorators import patient_required, _identity
from utils.cache import cache_get, cache_set
from datetime import datetime
import json
import os

patient_bp = Blueprint('patient', __name__)


def _get_client(identity):
    return Client.query.filter_by(user_id=identity['id']).first()


@patient_bp.route('/profile', methods=['GET'])
@jwt_required()
@patient_required
def profile():
    return jsonify(_get_client(_identity()).to_dict())


@patient_bp.route('/profile', methods=['PUT'])
@jwt_required()
@patient_required
def update_profile():
    c = _get_client(_identity())
    data = request.get_json()
    c.account.full_name = data.get('name', c.account.full_name)
    c.account.contact = data.get('phone', c.account.contact)
    c.gender = data.get('gender', c.gender)
    c.blood_type = data.get('blood_type', c.blood_type)
    c.location = data.get('location', c.location)
    if data.get('birth_date'):
        try:
            c.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    db.session.commit()
    return jsonify({'message': 'Profile updated', 'client': c.to_dict()})


@patient_bp.route('/physicians', methods=['GET'])
@jwt_required()
@patient_required
def get_physicians():
    search = request.args.get('q', '').strip()
    cache_key = f'client:physicians:{search}'
    cached = cache_get(cache_key)
    if cached:
        return jsonify(json.loads(cached))
    query = Physician.query.join(Account)
    if search:
        query = query.filter(
            db.or_(
                Account.full_name.ilike(f'%{search}%'),
                Physician.expertise.ilike(f'%{search}%'),
            )
        )
    docs = [d.to_dict() for d in query.all()]
    cache_set(cache_key, json.dumps(docs), 300)
    return jsonify(docs)


@patient_bp.route('/bookings', methods=['GET'])
@jwt_required()
@patient_required
def get_bookings():
    c = _get_client(_identity())
    bookings = Booking.query.filter_by(client_id=c.id).order_by(Booking.date.desc()).all()
    return jsonify([b.to_dict() for b in bookings])


@patient_bp.route('/bookings/<int:pid>', methods=['POST'])
@jwt_required()
@patient_required
def book_visit(pid):
    try:
        c = _get_client(_identity())
        physician = Physician.query.get_or_404(pid)
        data = request.get_json() or {}
        
        if not data.get('date') or not data.get('time'):
            return jsonify({'error': 'date and time are required'}), 400

        try:
            visit_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            if visit_date < datetime.today().date():
                return jsonify({'error': 'Date cannot be in the past'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

        valid_times = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM']
        if data['time'] not in valid_times:
            return jsonify({'error': 'Invalid time slot'}), 400

        conflict = Booking.query.filter_by(
            physician_id=pid, date=visit_date, time=data['time']
        ).filter(Booking.status.in_(['pending', 'approved'])).first()
        if conflict:
            return jsonify({'error': 'This slot is already booked'}), 409

        booking = Booking(
            client_id=c.id,
            physician_id=pid,
            date=visit_date,
            time=data['time'],
            reason=data.get('reason'),
        )
        db.session.add(booking)
        db.session.commit()
        
        # Try to add to Google Calendar (optional, don't fail if it doesn't work)
        calendar_link = None
        try:
            from utils.notifications import add_to_google_calendar
            from datetime import timedelta
            
            appointment_time = datetime.strptime(data['time'], '%I:%M %p').time()
            start_datetime = datetime.combine(visit_date, appointment_time)
            end_datetime = start_datetime + timedelta(hours=1)
            
            calendar_link = add_to_google_calendar(
                patient_email=c.account.email,
                summary=f"Appointment with {physician.account.full_name}",
                description=f"Consultation with {physician.account.full_name} ({physician.expertise})\nReason: {data.get('reason', 'General checkup')}",
                start_time=start_datetime,
                end_time=end_datetime
            )
        except Exception as e:
            print(f'[Calendar] Failed to add event: {e}')
        
        response = {'message': 'Visit booked', 'booking': booking.to_dict()}
        if calendar_link:
            response['calendar_link'] = calendar_link
        
        return jsonify(response), 201
    
    except Exception as e:
        print(f'[Booking Error] {str(e)}')
        db.session.rollback()
        return jsonify({'error': f'Booking failed: {str(e)}'}), 500


@patient_bp.route('/bookings/<int:id>/cancel', methods=['PUT'])
@jwt_required()
@patient_required
def cancel_booking(id):
    c = _get_client(_identity())
    b = Booking.query.get_or_404(id)
    if b.client_id != c.id:
        return jsonify({'error': 'Unauthorized'}), 403
    b.status = 'cancelled'
    db.session.commit()
    return jsonify({'message': 'Cancelled', 'booking': b.to_dict()})


@patient_bp.route('/notes', methods=['GET'])
@jwt_required()
@patient_required
def get_notes():
    c = _get_client(_identity())
    notes = CaseNote.query.filter_by(client_id=c.id).order_by(CaseNote.date.desc()).all()
    return jsonify([n.to_dict() for n in notes])


@patient_bp.route('/payments', methods=['POST'])
@jwt_required()
@patient_required
def process_payment():
    c = _get_client(_identity())
    data = request.get_json() or {}

    payment_method = data.get('payment_method', 'card')
    amount = data.get('amount')
    booking_id = data.get('booking_id')

    # Validate amount
    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({'error': 'Amount must be a positive number'}), 400

    # Validate booking if provided
    if booking_id:
        booking = Booking.query.get(booking_id)
        if not booking or booking.client_id != c.id:
            return jsonify({'error': 'Invalid booking selected'}), 400

    # Validate payment method specific fields
    if payment_method == 'card':
        card_number = str(data.get('card_number', '')).replace(' ', '').replace('-', '')
        expiry = str(data.get('expiry', '')).strip()
        cvv = str(data.get('cvv', '')).strip()

        if not card_number.isdigit() or not 13 <= len(card_number) <= 19:
            return jsonify({'error': 'Card number must be 13-19 digits (e.g., 4532015112830366)'}), 400
        if not expiry or len(expiry) not in (4,5) or '/' not in expiry:
            return jsonify({'error': 'Expiry must be in MM/YY format (e.g., 12/25)'}), 400
        try:
            mm, yy = expiry.split('/')
            mm = int(mm); yy = int(yy)
            if not (1 <= mm <= 12):
                raise ValueError
        except ValueError:
            return jsonify({'error': 'Invalid expiry date. Use MM/YY format (e.g., 12/25)'}), 400
        if not cvv.isdigit() or len(cvv) not in (3, 4):
            return jsonify({'error': 'CVV must be 3 or 4 digits'}), 400
        
        payment_info = f'Card ending in {card_number[-4:]}'
    
    elif payment_method == 'upi':
        upi_id = str(data.get('upi_id', '')).strip()
        
        if not upi_id or '@' not in upi_id:
            return jsonify({'error': 'Invalid UPI ID. Format: username@provider (e.g., john@paytm)'}), 400
        
        # Basic UPI ID validation
        parts = upi_id.split('@')
        if len(parts) != 2 or not parts[0] or not parts[1]:
            return jsonify({'error': 'Invalid UPI ID format. Use: username@provider'}), 400
        
        payment_info = f'UPI: {upi_id}'
    
    else:
        return jsonify({'error': 'Invalid payment method'}), 400

    return jsonify({
        'message': f'Payment processed successfully via {payment_method.upper()} (demo mode)',
        'payment': {
            'patient_id': c.id,
            'amount': amount,
            'booking_id': booking_id,
            'payment_method': payment_method,
            'payment_info': payment_info,
            'status': 'succeeded',
            'transaction_id': f'TXN{payment_method.upper()}{int(amount*100)}{c.id}'
        }
    }), 201


@patient_bp.route('/download-csv', methods=['POST'])
@jwt_required()
@patient_required
def download_csv():
    from tasks import export_client_csv_task
    c = _get_client(_identity())
    task = export_client_csv_task.delay(c.id)
    return jsonify({'task_id': task.id, 'message': 'Export started'})


@patient_bp.route('/task/<task_id>', methods=['GET'])
@jwt_required()
@patient_required
def check_task(task_id):
    from celery_worker import celery_app
    task = celery_app.AsyncResult(task_id)
    if task.state == 'SUCCESS':
        return jsonify({'status': 'done', 'result': task.result})
    elif task.state == 'FAILURE':
        return jsonify({'status': 'failed'}), 500
    return jsonify({'status': 'pending'})
