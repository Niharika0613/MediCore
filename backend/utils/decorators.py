from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
import json


def _identity():
    raw = get_jwt_identity()
    return json.loads(raw) if isinstance(raw, str) else raw


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        identity = _identity()
        if identity.get('user_type') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


def doctor_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        identity = _identity()
        if identity.get('user_type') != 'doctor':
            return jsonify({'error': 'Physician access required'}), 403
        return f(*args, **kwargs)
    return decorated


def patient_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        identity = _identity()
        if identity.get('user_type') != 'patient':
            return jsonify({'error': 'Client access required'}), 403
        return f(*args, **kwargs)
    return decorated
