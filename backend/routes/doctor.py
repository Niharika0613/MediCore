from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Physician, Client, Booking, CaseNote, PhysicianSchedule
from utils.decorators import doctor_required, _identity
from datetime import datetime, date, timedelta

doctor_bp = Blueprint('doctor', __name__)


def _get_physician(identity):
    return Physician.query.filter_by(user_id=identity['id']).first()


@doctor_bp.route('/profile', methods=['GET'])
@jwt_required()
@doctor_required
def profile():
    p = _get_physician(_identity())
    if not p:
        return jsonify({'error': 'Profile not found'}), 404
    return jsonify(p.to_dict())


@doctor_bp.route('/profile', methods=['PUT'])
@jwt_required()
@doctor_required
def update_profile():
    p = _get_physician(_identity())
    data = request.get_json()
    p.account.full_name = data.get('name', p.account.full_name)
    p.account.contact = data.get('phone', p.account.contact)
    p.expertise = data.get('expertise', p.expertise)
    p.years_exp = int(data.get('years_exp', p.years_exp) or 0)
    p.consult_fee = float(data.get('consult_fee', p.consult_fee) or 0)
    p.schedule_text = data.get('schedule_text', p.schedule_text)
    p.about = data.get('about', p.about)
    db.session.commit()
    return jsonify({'message': 'Profile updated', 'physician': p.to_dict()})


@doctor_bp.route('/bookings', methods=['GET'])
@jwt_required()
@doctor_required
def get_bookings():
    p = _get_physician(_identity())
    bookings = Booking.query.filter_by(physician_id=p.id).order_by(Booking.date.desc()).all()
    return jsonify([b.to_dict() for b in bookings])


@doctor_bp.route('/bookings/<int:id>/approve', methods=['PUT'])
@jwt_required()
@doctor_required
def approve(id):
    p = _get_physician(_identity())
    b = Booking.query.get_or_404(id)
    if b.physician_id != p.id:
        return jsonify({'error': 'Unauthorized'}), 403
    b.status = 'approved'
    db.session.commit()
    return jsonify({'message': 'Approved', 'booking': b.to_dict()})


@doctor_bp.route('/bookings/<int:id>/complete', methods=['PUT'])
@jwt_required()
@doctor_required
def complete(id):
    p = _get_physician(_identity())
    b = Booking.query.get_or_404(id)
    if b.physician_id != p.id:
        return jsonify({'error': 'Unauthorized'}), 403
    b.status = 'completed'
    db.session.commit()
    return jsonify({'message': 'Completed', 'booking': b.to_dict()})


@doctor_bp.route('/bookings/<int:id>/cancel', methods=['PUT'])
@jwt_required()
@doctor_required
def cancel(id):
    p = _get_physician(_identity())
    b = Booking.query.get_or_404(id)
    if b.physician_id != p.id:
        return jsonify({'error': 'Unauthorized'}), 403
    b.status = 'cancelled'
    db.session.commit()
    return jsonify({'message': 'Cancelled', 'booking': b.to_dict()})


@doctor_bp.route('/clients', methods=['GET'])
@jwt_required()
@doctor_required
def get_clients():
    p = _get_physician(_identity())
    bookings = Booking.query.filter_by(physician_id=p.id).all()
    cids = list(set(b.client_id for b in bookings))
    clients = Client.query.filter(Client.id.in_(cids)).all() if cids else []
    return jsonify([c.to_dict() for c in clients])


@doctor_bp.route('/notes', methods=['GET'])
@jwt_required()
@doctor_required
def get_notes():
    p = _get_physician(_identity())
    notes = CaseNote.query.filter_by(physician_id=p.id).order_by(CaseNote.date.desc()).all()
    return jsonify([n.to_dict() for n in notes])


@doctor_bp.route('/notes/<int:cid>', methods=['POST'])
@jwt_required()
@doctor_required
def add_note(cid):
    p = _get_physician(_identity())
    Client.query.get_or_404(cid)
    data = request.get_json() or {}
    if not data.get('condition') or not data.get('treatment'):
        return jsonify({'error': 'condition and treatment are required fields'}), 400

    note = CaseNote(
        client_id=cid,
        physician_id=p.id,
        booking_id=data.get('booking_id'),
        condition=data.get('condition').strip(),
        treatment=data.get('treatment').strip(),
        remarks=data.get('remarks', '').strip(),
    )
    db.session.add(note)
    db.session.commit()
    return jsonify({'message': 'Note added', 'note': note.to_dict()}), 201


@doctor_bp.route('/schedule', methods=['GET'])
@jwt_required()
@doctor_required
def get_schedule():
    p = _get_physician(_identity())
    today = date.today()
    result = []
    for i in range(7):
        day = today + timedelta(days=i)
        slot = PhysicianSchedule.query.filter_by(physician_id=p.id, date=day).first()
        result.append({'date': str(day), 'is_open': slot.is_open if slot else True})
    return jsonify(result)


@doctor_bp.route('/schedule', methods=['POST'])
@jwt_required()
@doctor_required
def set_schedule():
    p = _get_physician(_identity())
    for item in request.get_json():
        day = datetime.strptime(item['date'], '%Y-%m-%d').date()
        slot = PhysicianSchedule.query.filter_by(physician_id=p.id, date=day).first()
        if slot:
            slot.is_open = item['is_open']
        else:
            db.session.add(PhysicianSchedule(physician_id=p.id, date=day, is_open=item['is_open']))
    db.session.commit()
    return jsonify({'message': 'Schedule updated'})
