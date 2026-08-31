import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(BASE_DIR, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app import app, init_db

if __name__ == '__main__':
    init_db(app)
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
