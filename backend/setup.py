"""
MediCore Setup Script
Checks and installs all required dependencies for notification system
"""

import os
import sys
import subprocess

def print_header(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def check_python_version():
    """Check if Python version is compatible"""
    print_header("CHECKING PYTHON VERSION")
    version = sys.version_info
    print(f"\nPython version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Python 3.7 or higher is required")
        return False
    
    print("✅ Python version is compatible")
    return True

def check_pip():
    """Check if pip is installed"""
    print_header("CHECKING PIP")
    try:
        result = subprocess.run(['pip', '--version'], capture_output=True, text=True)
        print(f"\n{result.stdout.strip()}")
        print("✅ pip is installed")
        return True
    except FileNotFoundError:
        print("❌ pip is not installed")
        return False

def install_requirements():
    """Install required packages"""
    print_header("INSTALLING REQUIREMENTS")
    
    if not os.path.exists('requirements.txt'):
        print("❌ requirements.txt not found")
        return False
    
    print("\n📦 Installing packages from requirements.txt...")
    try:
        subprocess.run(['pip', 'install', '-r', 'requirements.txt'], check=True)
        print("\n✅ All packages installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("\n❌ Failed to install packages")
        return False

def check_env_file():
    """Check if .env file exists"""
    print_header("CHECKING ENVIRONMENT FILE")
    
    if os.path.exists('.env'):
        print("\n✅ .env file exists")
        return True
    
    print("\n⚠️  .env file not found")
    
    if os.path.exists('.env.example'):
        print("\n📋 Creating .env from .env.example...")
        try:
            with open('.env.example', 'r') as src:
                content = src.read()
            with open('.env', 'w') as dst:
                dst.write(content)
            print("✅ .env file created")
            print("\n⚠️  Please configure your credentials in .env file")
            return True
        except Exception as e:
            print(f"❌ Failed to create .env: {e}")
            return False
    
    print("❌ .env.example not found")
    return False

def check_redis():
    """Check if Redis is accessible"""
    print_header("CHECKING REDIS")
    
    try:
        result = subprocess.run(['redis-cli', 'ping'], capture_output=True, text=True, timeout=5)
        if 'PONG' in result.stdout:
            print("\n✅ Redis is running")
            return True
        else:
            print("\n❌ Redis is not responding")
            return False
    except FileNotFoundError:
        print("\n⚠️  Redis CLI not found")
        print("\nTo install Redis:")
        print("  Windows: https://github.com/microsoftarchive/redis/releases")
        print("  WSL/Linux: sudo apt install redis-server")
        return False
    except subprocess.TimeoutExpired:
        print("\n❌ Redis connection timeout")
        return False
    except Exception as e:
        print(f"\n⚠️  Could not check Redis: {e}")
        return False

def check_database():
    """Check if database exists"""
    print_header("CHECKING DATABASE")
    
    db_path = os.path.join('instance', 'medicore.db')
    
    if os.path.exists(db_path):
        print(f"\n✅ Database exists: {db_path}")
        return True
    
    print(f"\n⚠️  Database not found: {db_path}")
    print("\n📋 Creating database...")
    
    try:
        # Run app.py to initialize database
        subprocess.run([sys.executable, 'app.py'], timeout=5)
        print("✅ Database created")
        return True
    except subprocess.TimeoutExpired:
        # This is expected as app.py runs the server
        if os.path.exists(db_path):
            print("✅ Database created")
            return True
        print("❌ Failed to create database")
        return False
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def check_test_files():
    """Check if all test files exist"""
    print_header("CHECKING TEST FILES")
    
    test_files = [
        'test_notifications.py',
        'test_reminder_task.py',
        'test_calendar.py',
        'test_google_chat.py',
        'update_patient_phone.py',
        'run_tests.py',
        'verify_twilio.py'
    ]
    
    all_exist = True
    for file in test_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} not found")
            all_exist = False
    
    return all_exist

def print_summary(results):
    """Print setup summary"""
    print_header("SETUP SUMMARY")
    
    print("\n📊 Status:")
    for check, status in results.items():
        icon = "✅" if status else "❌"
        print(f"  {icon} {check}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n" + "=" * 70)
        print("  ✅ SETUP COMPLETE!")
        print("=" * 70)
        print("\n🚀 Next Steps:")
        print("  1. Configure .env with your credentials")
        print("  2. Start Redis: redis-server")
        print("  3. Run tests: python run_tests.py")
        print("  4. Or start all services: start_services.bat")
    else:
        print("\n" + "=" * 70)
        print("  ⚠️  SETUP INCOMPLETE")
        print("=" * 70)
        print("\n🔧 Please fix the issues above and run setup again")

def main():
    print_header("MEDICORE NOTIFICATION SYSTEM SETUP")
    print("\nThis script will check and install all required dependencies")
    
    results = {}
    
    # Run all checks
    results['Python Version'] = check_python_version()
    results['pip'] = check_pip()
    
    if results['pip']:
        results['Requirements'] = install_requirements()
    else:
        results['Requirements'] = False
    
    results['Environment File'] = check_env_file()
    results['Redis'] = check_redis()
    results['Database'] = check_database()
    results['Test Files'] = check_test_files()
    
    # Print summary
    print_summary(results)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Setup interrupted by user")
        sys.exit(0)
