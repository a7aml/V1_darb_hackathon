import sys
import os

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')
))

from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

def test_server():
    print("\n🔍 Test 1 — Server starts correctly")
    with app.app_context():
        print("✅ Flask app created successfully")
        print(f"   ENV: {os.getenv('FLASK_ENV')}")

def test_db_connection():
    print("\n🔍 Test 2 — Database connection")
    with app.app_context():
        try:
            result = db.session.execute(text('SELECT 1'))
            print("✅ Database connected successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")

def test_db_query():
    print("\n🔍 Test 3 — Basic query")
    with app.app_context():
        try:
            result = db.session.execute(
                text("SELECT current_database(), current_user, version()")
            )
            row = result.fetchone()
            print("✅ Query executed successfully")
            print(f"   Database : {row[0]}")
            print(f"   User     : {row[1]}")
            print(f"   Version  : {row[2][:40]}...")
        except Exception as e:
            print(f"❌ Query failed: {e}")

def test_env_vars():
    print("\n🔍 Test 4 — Environment variables")
    db_url = os.getenv("DATABASE_URL")
    secret  = os.getenv("SECRET_KEY")

    if db_url:
        # Hide password in output
        safe_url = db_url.split('@')[-1]
        print(f"✅ DATABASE_URL found → ...@{safe_url}")
    else:
        print("❌ DATABASE_URL is missing from .env")

    if secret:
        print(f"✅ SECRET_KEY found")
    else:
        print("❌ SECRET_KEY is missing from .env")

if __name__ == '__main__':
    print("=" * 50)
    print("   HACKATHON STARTER — CONNECTION TESTS")
    print("=" * 50)

    test_env_vars()
    test_server()
    test_db_connection()
    test_db_query()

    print("\n" + "=" * 50)
    print("   ALL TESTS DONE")
    print("=" * 50 + "\n")