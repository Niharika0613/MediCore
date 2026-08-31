# 🏥 MediCore Backend - Notification & Reminder System

Complete notification and reminder system for the MediCore healthcare application.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Application
```bash
python app.py              # Main Flask server
```

### 3. Start Background Services (Optional)
```bash
start_services.bat         # Windows - starts worker & beat
```

---

## 📋 Features

### ✅ Implemented Notifications
- **SMS Notifications** - Via Twilio
- **WhatsApp Messages** - Via Twilio
- **Appointment Reminders** - 3 hours before appointment
- **Google Calendar** - Automatic event creation
- **Google Chat** - Daily summaries and alerts
- **Email Reports** - Monthly physician reports

### ✅ Automated Tasks (Celery)
- Hourly appointment reminder checks
- Daily appointment summaries
- Monthly report generation
- Background task processing

---

## 📁 Project Structure

```
backend/
├── models/              # Database models
├── routes/              # API endpoints
│   ├── auth.py         # Authentication
│   ├── admin.py        # Admin operations
│   ├── doctor.py       # Physician operations
│   └── patient.py      # Patient operations
├── utils/              # Utility functions
│   ├── notifications.py # Notification handlers
│   ├── decorators.py   # JWT decorators
│   └── cache.py        # Redis cache
├── instance/           # Database
│   └── medicore.db
├── app.py              # Flask application
├── celery_worker.py    # Celery configuration
├── tasks.py            # Celery tasks
├── config.py           # Configuration
├── seed.py             # Database seeder
├── requirements.txt    # Dependencies
└── .env                # Environment variables
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Flask
SECRET_KEY=medicore_v1_dev_secret
JWT_SECRET_KEY=medicore_jwt_dev_secret
FLASK_DEBUG=true

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Twilio (SMS & WhatsApp)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Google Calendar (optional)
GOOGLE_CALENDAR_CREDENTIALS_FILE=credentials.json
REMINDER_HOURS_BEFORE=3

# Google Chat (optional)
GOOGLE_CHAT_WEBHOOK_URL=your_webhook_url
```

---

## 🔧 Prerequisites

### Required
- Python 3.7+
- Redis server
- Twilio account (already configured)

### Optional
- Google Calendar credentials.json
- Google Chat webhook
- SMTP credentials for email

### Install Redis

**Windows:**
```bash
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use WSL: sudo apt install redis-server
```

**Start Redis:**
```bash
redis-server
```

**Verify:**
```bash
redis-cli ping    # Should return: PONG
```

---

## 🚀 Running the Application

### Option 1: Quick Start (Windows)
```bash
start_services.bat
```

### Option 2: Manual Start

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Flask Server:**
```bash
python app.py
```

**Terminal 3 - Celery Worker:**
```bash
celery -A celery_worker.celery_app worker --loglevel=info --pool=solo
```

**Terminal 4 - Celery Beat (Scheduler):**
```bash
celery -A celery_worker.celery_app beat --loglevel=info
```

---

## 🧪 Testing

### Test via Web Interface
1. Start the application: `python app.py`
2. Open http://localhost:5001
3. Login and book an appointment
4. Check console logs for notification status

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Patient Operations
- `GET /api/client/physicians` - List all physicians
- `POST /api/client/book` - Book appointment
- `GET /api/client/bookings` - Get patient bookings
- `GET /api/client/notes` - Get case notes

### Physician Operations
- `GET /api/physician/bookings` - Get doctor bookings
- `POST /api/physician/notes` - Add case note
- `PUT /api/physician/booking/<id>` - Update booking status

### Admin Operations
- `GET /api/manage/accounts` - List all accounts
- `POST /api/manage/account` - Create account
- `DELETE /api/manage/account/<id>` - Delete account

---

## 🔔 Notification System

### How It Works

1. **Appointment Booking**
   - Patient books appointment via web interface
   - Appointment stored in database

2. **Celery Beat (Scheduler)**
   - Runs every hour
   - Checks for appointments in next 3 hours

3. **Reminder Task**
   - Sends SMS to patient
   - Sends WhatsApp message
   - Creates Google Calendar event (if configured)

4. **Daily Summaries**
   - Sends to Google Chat (if configured)
   - Lists all appointments for the day

5. **Monthly Reports**
   - Generates HTML reports
   - Emails to physicians (if SMTP configured)

---

## 🐛 Troubleshooting

### SMS/WhatsApp Not Working
- Verify phone number format: `+919900001001`
- Check Twilio account credentials in `.env`
- For WhatsApp: Join Twilio sandbox first

### Celery Not Working
```bash
redis-cli ping             # Check Redis
```
- Ensure Redis is running
- Restart Celery worker
- Check console logs

### Calendar Not Working
- Download `credentials.json` from Google Cloud Console
- Place in `/backend` folder
- Delete `token.pickle` and try again

### Database Issues
```bash
python seed.py             # Repopulate demo data
```

---

## 📊 Database Schema

### Main Tables
- **Account** - User accounts (admin, doctor, patient)
- **Physician** - Doctor profiles
- **Client** - Patient profiles
- **Booking** - Appointments
- **CaseNote** - Medical notes
- **Division** - Medical departments

---

## 🔐 Security

- Environment variables for sensitive data
- Password hashing with Werkzeug
- JWT token authentication
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)

---

## 📈 Performance

- Redis caching for session data
- Celery for background tasks
- SQLite database (development)
- Async task processing

---

## 🚀 Deployment

### Development
```bash
python app.py    # Debug mode enabled
```

### Production
```bash
# Set environment variables
export FLASK_DEBUG=false

# Use production WSGI server
gunicorn -w 4 -b 0.0.0.0:5001 app:app

# Start Celery workers
celery -A celery_worker.celery_app worker -l info

# Start Celery beat
celery -A celery_worker.celery_app beat -l info
```

---

## 📞 Support

### Documentation
- **README.md** (root) - General overview
- **STARTUP_GUIDE.md** - Complete startup instructions  
- **QUICK_SETUP.md** - Google Calendar setup
- **api-spec.yaml** - OpenAPI 3.0 API documentation

### Useful Links
- Twilio Console: https://console.twilio.com/
- Google Cloud Console: https://console.cloud.google.com/
- Redis Download: https://github.com/microsoftarchive/redis/releases

---

## 🎯 Next Steps

1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Configure `.env` file with your credentials
3. ✅ Start application: `python app.py`
4. ✅ Access web interface at http://localhost:5001

---

## 📝 License

MediCore Healthcare Application - Internal Use

---

## 👥 Contributors

- Backend API & Database
- Notification System
- Celery Task Queue
- Testing Framework

---

**Ready to start?** Run `python app.py` 🚀
