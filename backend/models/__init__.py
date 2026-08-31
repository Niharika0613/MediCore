from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date

db = SQLAlchemy()


class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    handle = db.Column(db.String(80), unique=True, nullable=False)
    passwd_hash = db.Column(db.String(200), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # admin, doctor, patient
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    contact = db.Column(db.String(15))
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.passwd_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.passwd_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'handle': self.handle,
            'user_type': self.user_type,
            'full_name': self.full_name,
            'email': self.email,
            'contact': self.contact,
        }


class Division(db.Model):
    __tablename__ = 'divisions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    overview = db.Column(db.Text)
    physicians = db.relationship('Physician', backref='division', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'overview': self.overview,
            'physician_count': len(self.physicians),
        }


class Physician(db.Model):
    __tablename__ = 'physicians'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    division_id = db.Column(db.Integer, db.ForeignKey('divisions.id'))
    expertise = db.Column(db.String(100), nullable=False)
    years_exp = db.Column(db.Integer, default=0)
    consult_fee = db.Column(db.Float, default=0)
    schedule_text = db.Column(db.String(200))
    about = db.Column(db.Text)
    account = db.relationship('Account', backref=db.backref('physician', uselist=False))
    bookings = db.relationship('Booking', backref='physician', lazy=True)
    case_notes = db.relationship('CaseNote', backref='physician', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.account.full_name,
            'email': self.account.email,
            'contact': self.account.contact,
            'expertise': self.expertise,
            'years_exp': self.years_exp,
            'consult_fee': self.consult_fee,
            'schedule_text': self.schedule_text,
            'about': self.about,
            'division_id': self.division_id,
            'division_name': self.division.name if self.division else None,
        }


class PhysicianSchedule(db.Model):
    __tablename__ = 'physician_schedules'
    id = db.Column(db.Integer, primary_key=True)
    physician_id = db.Column(db.Integer, db.ForeignKey('physicians.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    is_open = db.Column(db.Boolean, default=True)
    __table_args__ = (db.UniqueConstraint('physician_id', 'date'),)


class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    birth_date = db.Column(db.Date)
    gender = db.Column(db.String(10))
    blood_type = db.Column(db.String(5))
    location = db.Column(db.Text)
    account = db.relationship('Account', backref=db.backref('client', uselist=False))
    bookings = db.relationship('Booking', backref='client', lazy=True)
    case_notes = db.relationship('CaseNote', backref='client', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.account.full_name,
            'email': self.account.email,
            'contact': self.account.contact,
            'birth_date': str(self.birth_date) if self.birth_date else None,
            'gender': self.gender,
            'blood_type': self.blood_type,
            'location': self.location,
        }


class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    physician_id = db.Column(db.Integer, db.ForeignKey('physicians.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, completed, cancelled
    reason = db.Column(db.Text)
    booked_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'client_name': self.client.account.full_name,
            'client_email': self.client.account.email,
            'physician_id': self.physician_id,
            'physician_name': self.physician.account.full_name,
            'physician_expertise': self.physician.expertise,
            'physician_fee': self.physician.consult_fee,
            'date': str(self.date),
            'time': self.time,
            'status': self.status,
            'reason': self.reason,
        }


class CaseNote(db.Model):
    __tablename__ = 'case_notes'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    physician_id = db.Column(db.Integer, db.ForeignKey('physicians.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=True)
    date = db.Column(db.Date, default=date.today)
    condition = db.Column(db.Text)
    treatment = db.Column(db.Text)
    remarks = db.Column(db.Text)
    booking = db.relationship('Booking', backref='case_note')

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'client_name': self.client.account.full_name,
            'physician_id': self.physician_id,
            'physician_name': self.physician.account.full_name,
            'booking_id': self.booking_id,
            'date': str(self.date),
            'condition': self.condition,
            'treatment': self.treatment,
            'remarks': self.remarks,
        }
