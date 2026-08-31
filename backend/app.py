import os
from flask import Flask, render_template, send_from_directory
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from models import db
from config import Config

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend', 'src')


def create_app():
    app = Flask(
        __name__,
        static_folder=FRONTEND_DIR,
        static_url_path='/static',
        template_folder=FRONTEND_DIR,
    )
    app.config.from_object(Config)

    db.init_app(app)
    JWTManager(app)
    CORS(app, origins=['http://localhost:5001', 'http://127.0.0.1:5001'], supports_credentials=True)

    from routes.auth    import auth_bp
    from routes.admin   import admin_bp
    from routes.doctor  import doctor_bp
    from routes.patient import patient_bp

    app.register_blueprint(auth_bp,    url_prefix='/api/auth')
    app.register_blueprint(admin_bp,   url_prefix='/api/manage')
    app.register_blueprint(doctor_bp,  url_prefix='/api/physician')
    app.register_blueprint(patient_bp, url_prefix='/api/client')

    @app.route('/exports/<filename>')
    def serve_export(filename):
        exports_dir = os.path.join(BASE_DIR, 'exports')
        return send_from_directory(exports_dir, filename, as_attachment=True)

    # SPA catch-all — serve index.html for every non-API route
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        return render_template('index.html')

    return app


def init_db(app):
    with app.app_context():
        db.create_all()
        from models import Account, Division

        if not Account.query.filter_by(handle='admin').first():
            admin = Account(
                handle='admin',
                full_name='Administrator',
                email='admin@medicore.com',
                contact='1234567890',
                user_type='admin',
            )
            admin.set_password('admin123')
            db.session.add(admin)

        for div_name in ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics',
                         'Dermatology', 'General Medicine', 'Oncology', 'ENT']:
            if not Division.query.filter_by(name=div_name).first():
                db.session.add(Division(name=div_name, overview=f'{div_name} division'))

        db.session.commit()


if __name__ == '__main__':
    app = create_app()
    init_db(app)
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(debug=debug, port=5001)
