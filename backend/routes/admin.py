from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Account, Physician, Client, Booking, CaseNote, Division
from utils.decorators import admin_required
from utils.cache import cache_get, cache_set, cache_delete_pattern
import json

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/overview', methods=['GET'])
@jwt_required()
@admin_required
def overview():
    cached = cache_get('manage:overview')
    if cached:
        return jsonify(json.loads(cached))
    data = {
        'physicians': Physician.query.count(),
        'clients': Client.query.count(),
        'bookings': Booking.query.count(),
        'pending': Booking.query.filter_by(status='pending').count(),
        'approved': Booking.query.filter_by(status='approved').count(),
        'completed': Booking.query.filter_by(status='completed').count(),
        'cancelled': Booking.query.filter_by(status='cancelled').count(),
        'divisions': Division.query.count(),
    }
    cache_set('manage:overview', json.dumps(data), 60)
    return jsonify(data)


@admin_bp.route('/reports/monthly', methods=['GET'])
@jwt_required()
@admin_required
def monthly_report():
    from datetime import datetime
    month = int(request.args.get('month', datetime.utcnow().month))
    year = int(request.args.get('year', datetime.utcnow().year))
    start = f"{year}-{month:02d}-01"
    end_month = month + 1 if month < 12 else 1
    end_year = year if month < 12 else year + 1

    total_bookings = Booking.query.filter(Booking.date >= start, Booking.date < f"{end_year}-{end_month:02d}-01").count()
    status_counts = {s: Booking.query.filter(Booking.date >= start, Booking.date < f"{end_year}-{end_month:02d}-01", Booking.status == s).count() for s in ['pending','approved','completed','cancelled']}
    revenue = db.session.query(db.func.coalesce(db.func.sum(Physician.consult_fee), 0.0)).join(Booking, Physician.id == Booking.physician_id).filter(Booking.date >= start, Booking.date < f"{end_year}-{end_month:02d}-01", Booking.status == 'completed').scalar() or 0.0

    return jsonify({
        'month': month,
        'year': year,
        'total_bookings': total_bookings,
        'status_counts': status_counts,
        'revenue': float(revenue)
    })


@admin_bp.route('/physicians', methods=['GET'])
@jwt_required()
@admin_required
def get_physicians():
    search = request.args.get('q', '').strip()
    cache_key = f'manage:physicians:{search}'
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


@admin_bp.route('/physicians', methods=['POST'])
@jwt_required()
@admin_required
def add_physician():
    data = request.get_json() or {}
    required = ['username', 'name', 'email', 'password', 'expertise']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    if Account.query.filter_by(handle=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    if Account.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400

    account = Account(
        handle=data['username'],
        full_name=data['name'],
        email=data['email'],
        contact=data.get('phone'),
        user_type='doctor',
    )
    account.set_password(data['password'])
    db.session.add(account)
    db.session.flush()

    physician = Physician(
        user_id=account.id,
        expertise=data['expertise'],
        years_exp=int(data.get('years_exp', 0) or 0),
        consult_fee=float(data.get('consult_fee', 0) or 0),
        schedule_text=data.get('schedule_text'),
        division_id=data.get('division_id') or None,
        about=data.get('about'),
    )
    db.session.add(physician)
    db.session.commit()
    cache_delete_pattern('manage:physicians')
    cache_delete_pattern('manage:overview')
    return jsonify({'message': 'Physician added', 'physician': physician.to_dict()}), 201


@admin_bp.route('/physicians/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def edit_physician(id):
    p = Physician.query.get_or_404(id)
    data = request.get_json() or {}
    if not data.get('name') and not data.get('expertise') and not data.get('email'):
        return jsonify({'error': 'At least one field must be provided to update'}), 400

    p.account.full_name = data.get('name', p.account.full_name)
    p.account.email = data.get('email', p.account.email)
    p.account.contact = data.get('phone', p.account.contact)
    p.expertise = data.get('expertise', p.expertise)
    p.years_exp = int(data.get('years_exp', p.years_exp) or 0)
    p.consult_fee = float(data.get('consult_fee', p.consult_fee) or 0)
    p.schedule_text = data.get('schedule_text', p.schedule_text)
    p.division_id = data.get('division_id') or p.division_id
    p.about = data.get('about', p.about)
    db.session.commit()
    cache_delete_pattern('manage:physicians')
    cache_delete_pattern('manage:overview')
    return jsonify({'message': 'Physician updated', 'physician': p.to_dict()})


@admin_bp.route('/physicians/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_physician(id):
    p = Physician.query.get_or_404(id)
    acc = p.account
    Booking.query.filter_by(physician_id=p.id).delete()
    CaseNote.query.filter_by(physician_id=p.id).delete()
    db.session.delete(p)
    db.session.delete(acc)
    db.session.commit()
    cache_delete_pattern('manage:physicians')
    cache_delete_pattern('manage:overview')
    return jsonify({'message': 'Physician deleted'})


@admin_bp.route('/clients', methods=['GET'])
@jwt_required()
@admin_required
def get_clients():
    search = request.args.get('q', '').strip()
    query = Client.query.join(Account)
    if search:
        query = query.filter(
            db.or_(
                Account.full_name.ilike(f'%{search}%'),
                Account.email.ilike(f'%{search}%'),
            )
        )
    return jsonify([c.to_dict() for c in query.all()])


@admin_bp.route('/clients', methods=['POST'])
@jwt_required()
@admin_required
def add_client():
    data = request.get_json() or {}
    required = ['username', 'name', 'email', 'password']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    if Account.query.filter_by(handle=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    if Account.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400

    account = Account(
        handle=data['username'],
        full_name=data['name'],
        email=data['email'],
        contact=data.get('phone'),
        user_type='patient',
    )
    account.set_password(data['password'])
    db.session.add(account)
    db.session.flush()

    from datetime import datetime
    birth_date = None
    if data.get('birth_date'):
        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except:
            pass

    client = Client(
        user_id=account.id,
        birth_date=birth_date,
        gender=data.get('gender'),
        blood_type=data.get('blood_type'),
        location=data.get('location'),
    )
    db.session.add(client)
    db.session.commit()
    cache_delete_pattern('manage:overview')
    return jsonify({'message': 'Client added', 'client': client.to_dict()}), 201


@admin_bp.route('/clients/<int:id>', methods=['GET'])
@jwt_required()
@admin_required
def view_client(id):
    c = Client.query.get_or_404(id)
    data = c.to_dict()
    data['bookings'] = [b.to_dict() for b in c.bookings]
    data['case_notes'] = [n.to_dict() for n in c.case_notes]
    return jsonify(data)


@admin_bp.route('/clients/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def edit_client(id):
    c = Client.query.get_or_404(id)
    data = request.get_json() or {}
    if not data.get('name') and not data.get('email'):
        return jsonify({'error': 'At least one field must be provided to update'}), 400

    c.account.full_name = data.get('name', c.account.full_name)
    c.account.email = data.get('email', c.account.email)
    c.account.contact = data.get('phone', c.account.contact)
    c.gender = data.get('gender', c.gender)
    c.blood_type = data.get('blood_type', c.blood_type)
    c.location = data.get('location', c.location)
    
    if data.get('birth_date'):
        from datetime import datetime
        try:
            c.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except:
            pass
    
    db.session.commit()
    cache_delete_pattern('manage:overview')
    return jsonify({'message': 'Client updated', 'client': c.to_dict()})


@admin_bp.route('/clients/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_client(id):
    c = Client.query.get_or_404(id)
    acc = c.account
    Booking.query.filter_by(client_id=c.id).delete()
    CaseNote.query.filter_by(client_id=c.id).delete()
    db.session.delete(c)
    db.session.delete(acc)
    db.session.commit()
    cache_delete_pattern('manage:overview')
    return jsonify({'message': 'Client deleted'})


@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
@admin_required
def get_bookings():
    bookings = Booking.query.order_by(Booking.date.desc()).all()
    return jsonify([b.to_dict() for b in bookings])


@admin_bp.route('/divisions', methods=['GET'])
@jwt_required()
def get_divisions():
    return jsonify([d.to_dict() for d in Division.query.all()])
