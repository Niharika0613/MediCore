import os
from datetime import datetime, timedelta
from twilio.rest import Client as TwilioClient
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle


def send_sms(to_phone, message):
    """Send SMS using Twilio"""
    try:
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        from_phone = os.environ.get('TWILIO_PHONE_NUMBER')
        
        if not all([account_sid, auth_token, from_phone]):
            print('[SMS] Twilio credentials not configured')
            return False
        
        client = TwilioClient(account_sid, auth_token)
        message = client.messages.create(
            body=message,
            from_=from_phone,
            to=to_phone
        )
        print(f'[SMS] Sent to {to_phone}: {message.sid}')
        return True
    except Exception as e:
        print(f'[SMS] Error: {e}')
        return False


def send_whatsapp(to_phone, message):
    """Send WhatsApp message using Twilio"""
    try:
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        from_whatsapp = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
        
        if not all([account_sid, auth_token]):
            print('[WhatsApp] Twilio credentials not configured')
            return False
        
        if not to_phone.startswith('whatsapp:'):
            to_phone = f'whatsapp:{to_phone}'
        
        client = TwilioClient(account_sid, auth_token)
        message = client.messages.create(
            body=message,
            from_=from_whatsapp,
            to=to_phone
        )
        print(f'[WhatsApp] Sent to {to_phone}: {message.sid}')
        return True
    except Exception as e:
        print(f'[WhatsApp] Error: {e}')
        return False


def add_to_google_calendar(patient_email, summary, description, start_time, end_time):
    """Add appointment to Google Calendar"""
    try:
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        creds = None
        token_file = 'token.pickle'
        
        if os.path.exists(token_file):
            with open(token_file, 'rb') as token:
                creds = pickle.load(token)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                creds_file = os.environ.get('GOOGLE_CALENDAR_CREDENTIALS_FILE', 'credentials.json')
                if not os.path.exists(creds_file):
                    print('[Calendar] credentials.json not found')
                    return None
                flow = InstalledAppFlow.from_client_secrets_file(creds_file, SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open(token_file, 'wb') as token:
                pickle.dump(creds, token)
        
        service = build('calendar', 'v3', credentials=creds)
        
        event = {
            'summary': summary,
            'description': description,
            'start': {'dateTime': start_time.isoformat(), 'timeZone': 'UTC'},
            'end': {'dateTime': end_time.isoformat(), 'timeZone': 'UTC'},
            'attendees': [{'email': patient_email}],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 180},
                    {'method': 'popup', 'minutes': 30},
                ],
            },
        }
        
        event = service.events().insert(calendarId='primary', body=event, sendUpdates='all').execute()
        print(f'[Calendar] Event created: {event.get("htmlLink")}')
        return event.get('htmlLink')
    except Exception as e:
        print(f'[Calendar] Error: {e}')
        return None
