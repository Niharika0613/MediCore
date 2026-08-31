# MediCore — Hospital Management System

A comprehensive, full-stack hospital management and clinical operations platform designed to streamline doctor appointments, patient medical case notes, specialist schedules, and department analytics.

**Live Application**: [https://medicore-n9jm.onrender.com](https://medicore-n9jm.onrender.com)  
**Repository**: [https://github.com/Niharika0613/MediCore](https://github.com/Niharika0613/MediCore)

---

### Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Backend** | Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Gunicorn |
| **Frontend** | Vue.js 3 (SPA), Vue Router 4, Bootstrap 5, Chart.js, jsPDF |
| **Database** | SQLite / PostgreSQL |
| **Asynchronous & Caching** | Celery, Redis |
| **Integrations** | Twilio SMS/WhatsApp, Google Calendar API |

---

### System Architecture & Key Modules

#### 1. Administrator Portal
- **Division Oversight**: Add, update, and manage hospital departments (Cardiology, Neurology, Pediatrics, Orthopedics, Dermatology, General Medicine, Oncology, ENT).
- **Physician & Patient Directory**: Onboard specialist doctors, manage consulting fees and schedules, and maintain centralized patient profiles.
- **Analytics & Workload Visualization**: Interactive department workload distribution and monthly consultation trends rendered via Chart.js.

#### 2. Physician Workspace
- **Consultation Schedule**: Real-time view of daily appointment queues and patient booking statuses (Pending, Approved, Completed, Cancelled).
- **Clinical Case Notes**: Document diagnosis, treatment plans, and clinical remarks for each patient visit.
- **Patient History**: Review past medical records and case notes to ensure continuous patient care.

#### 3. Patient Portal
- **Specialist Discovery**: Search and filter physicians across departments with real-time consultation fee and schedule details.
- **Appointment Booking**: Seamless slot reservation with instant status tracking.
- **Digital Medical Records**: View past case notes, prescriptions, and export medical reports in PDF format using jsPDF.

---

### Demo Accounts

| Role | Username / Handle | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full system administration, physician management, analytics |
| **Physician (Cardiology)** | `dr.chen` | `doctor123` | Appointment queue, clinical case notes, patient histories |
| **Physician (Neurology)** | `dr.okonkwo` | `doctor123` | Appointment queue, clinical case notes, patient histories |
| **Patient** | `client.marcus` | `patient123` | Doctor booking, medical records, PDF export |
| **Patient** | `client.elena` | `patient123` | Doctor booking, medical records, PDF export |

---

### Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Niharika0613/MediCore.git
   cd MediCore
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Seed the demo database:**
   ```bash
   python backend/seed.py
   ```

5. **Start the development server:**
   ```bash
   python backend/app.py
   ```
   The application will be accessible locally at `http://localhost:5001`.

---

### Deployment Configuration (Render)

This application is deployed on Render as a Web Service:

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python backend/seed.py && gunicorn --chdir backend app:app`
- **Instance Type**: Free

---

### License
This project is open source and available under the MIT License.
