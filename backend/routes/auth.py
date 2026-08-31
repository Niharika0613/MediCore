from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, Account, Client
from datetime import datetime
import json

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    account = Account.query.filter_by(handle=data.get('username')).first()
    if not account or not account.check_password(data.get('password', '')):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=json.dumps({'id': account.id, 'user_type': account.user_type}))
    return jsonify({'token': token, 'user': account.to_dict()})


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    required = ['username', 'name', 'email', 'password']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    if Account.query.filter_by(handle=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    if Account.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400

    if '@' not in data['email'] or '.' not in data['email']:
        return jsonify({'error': 'Email is invalid'}), 400

    if len(data['password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

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

    birth_date = None
    if data.get('birth_date'):
        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except ValueError:
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
    return jsonify({'message': 'Registration successful'}), 201


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    identity = get_jwt_identity()
    account = Account.query.get(identity['id'])
    if not account:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'user': account.to_dict()})
