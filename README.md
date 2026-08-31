# MediCore — Hospital Management System

A full-stack clinic management system built with **Flask · Vue.js 3 · Bootstrap 5 · SQLite · Redis · Celery**.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Redis server (download: https://github.com/microsoftarchive/redis/releases)

### Installation & Setup

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate

# 2. Install dependencies
cd backend
pip install -r requirements.txt

# 3. Configure environment (optional - has defaults)
copy .env.example .env

# 4. Run the application
python app.py
```

**Application will start at:** http://localhost:5001

### Optional: Background Tasks (SMS/WhatsApp Reminders)

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Celery Worker
cd backend
celery -A celery_worker.celery_app worker --loglevel=info --pool=solo

# Terminal 3: Start Celery Beat (Scheduler)
celery -A celery_worker.celery_app beat --loglevel=info
```

### Seed Sample Data (Recommended)

```bash
cd backend
python seed.py
```

---## 📋 Features

### Three User Roles

**Admin**
- Manage physicians & clients (add/edit/delete)
- View all bookings and system statistics
- Generate monthly reports
- Clinic overview dashboard with charts

**Physician (Doctor)**
- Manage bookings (approve/complete/cancel)
- Add case notes for patients
- Set weekly availability schedule
- View patient history

**Client (Patient)**
- Search and book appointments with doctors
- View case notes and medical history
- Make payments (card/UPI)
- Export health records as CSV

### Notifications & Reminders
- **SMS Reminders** — Twilio integration (3 hours before appointment)
- **WhatsApp Messages** — Twilio WhatsApp API
- **Google Calendar** — Automatic event creation with email invites
- **Background Tasks** — Celery for async processing

---

## 🔑 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Doctor | `dr.shazia` | `doctor123` |
| Patient | `client.marcus` | `patient123` |

*More accounts available after running seed.py*

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Flask (Python) + Flask-JWT-Extended |
| Frontend | Vue.js 3 (CDN) + Vue Router 4 |
| Styling | Bootstrap 5 + Custom CSS |
| Database | SQLite + Flask-SQLAlchemy |
| Caching | Redis |
| Background Jobs | Celery + Redis |
| Notifications | Twilio (SMS/WhatsApp), Google Calendar |
| API Docs | OpenAPI 3.0 (api.yaml) |

---

## 📁 Project Structure

```
MediCore_23F3000211/
├── backend/
│   ├── models/          # Database models (Account, Physician, Client, Booking, etc.)
│   ├── routes/          # API endpoints
│   │   ├── auth.py      # Login/Register
│   │   ├── admin.py     # Admin operations
│   │   ├── doctor.py    # Physician operations
│   │   └── patient.py   # Patient operations
│   ├── utils/
│   │   ├── notifications.py  # SMS/WhatsApp/Calendar
│   │   ├── decorators.py     # JWT role guards
│   │   └── cache.py          # Redis cache
│   ├── app.py           # Flask application
│   ├── config.py        # Configuration
│   ├── celery_worker.py # Celery setup
│   ├── tasks.py         # Background tasks
│   ├── seed.py          # Sample data
│   └── requirements.txt # Dependencies
├── frontend/src/
│   ├── index.html       # SPA entry
│   ├── style.css        # Styles
│   └── components/
│       ├── main.js      # Vue app + Router
│       ├── store.js     # Auth state
│       ├── api.js       # Axios instance
│       └── views/       # Admin/Doctor/Patient views
├── static/              # Production frontend
├── instance/            # SQLite database
├── api.yaml             # OpenAPI 3.0 specification
└── README.md            # This file
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Flask
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
FLASK_DEBUG=true

# Redis & Celery (for background tasks)
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Twilio (SMS & WhatsApp) - Optional
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Google Calendar - Optional
GOOGLE_CALENDAR_CREDENTIALS_FILE=credentials.json
REMINDER_HOURS_BEFORE=3
```

### Google Calendar Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project and enable Google Calendar API
3. Create OAuth credentials (Desktop app)
4. Download as `credentials.json` and place in `backend/` folder
5. First booking will prompt for authorization

---

## 🔌 API Documentation

**OpenAPI 3.0 Specification:** `api.yaml`

### Main Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Patient registration
- `GET /api/auth/me` - Get current user

**Patient**
- `GET /api/client/physicians` - Search doctors
- `POST /api/client/bookings/{id}` - Book appointment
- `GET /api/client/bookings` - View bookings
- `POST /api/client/payments` - Process payment
- `GET /api/client/notes` - View case notes

**Doctor**
- `GET /api/physician/bookings` - View appointments
- `PUT /api/physician/bookings/{id}/approve` - Approve booking
- `POST /api/physician/notes/{client_id}` - Add case note
- `GET /api/physician/schedule` - View schedule

**Admin**
- `GET /api/manage/overview` - System statistics
- `GET /api/manage/physicians` - Manage doctors
- `GET /api/manage/clients` - Manage patients
- `GET /api/manage/reports/monthly` - Monthly reports

*Import `api.yaml` into Swagger UI or Postman for full documentation*

---

## 🧪 Testing

### Manual Testing
1. Start application: `python app.py`
2. Open http://localhost:5001
3. Login with default credentials
4. Test features:
   - Patient: Book appointment
   - Doctor: Approve/complete booking
   - Admin: View statistics

### Test Notifications
- Book appointment → Check console for Google Calendar link
- With Celery running → SMS/WhatsApp sent 3 hours before

---

## 🐛 Troubleshooting

**Port 5001 already in use**
```bash
# Find and kill process
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**Redis connection error**
- Start Redis: `redis-server`
- Or skip Celery (app works without background tasks)

**Database errors**
```bash
# Reset database
cd backend
del instance\medicore.db
python app.py  # Will recreate
python seed.py # Add sample data
```

**SMS/WhatsApp not working**
- Check Twilio credentials in `.env`
- Verify phone number format: `+919900001001`
- Trial accounts: Add verified numbers in Twilio console

---

## 📦 Dependencies

**Backend (requirements.txt)**
- Flask, Flask-SQLAlchemy, Flask-JWT-Extended
- Celery, Redis
- Twilio (SMS/WhatsApp)
- Google Calendar API
- And more...

**Frontend**
- Vue.js 3 (CDN)
- Bootstrap 5 (CDN)
- Axios (CDN)

---

## 🚀 Production Deployment

```bash
# Set production environment
set FLASK_DEBUG=false

# Use production server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app

# Start Celery workers
celery -A celery_worker.celery_app worker -l info
celery -A celery_worker.celery_app beat -l info
```

---

## 📄 License

MediCore Healthcare Management System - Educational Project

---

## 👨‍💻 Support

- **API Documentation:** See `api.yaml`
- **Backend Details:** See `backend/README.md`
- **Issues:** Check troubleshooting section above

---

**Ready to use! 🏥** Start with `python app.py` and open http://localhost:5001
