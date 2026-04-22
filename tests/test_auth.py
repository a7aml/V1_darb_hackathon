import requests
import json

BASE_URL = "http://localhost:5000/api/auth"

def print_result(test_name, response):
    print(f"\n{'='*50}")
    print(f"🔍 {test_name}")
    print(f"   Status Code : {response.status_code}")
    try:
        print(f"   Response    : {json.dumps(response.json(), indent=2)}")
    except:
        print(f"   Response    : {response.text}")
    print(f"{'='*50}")


# ─── TEST DATA ────────────────────────────────────────────

TEST_EMAIL    = "testuser@studygpt.com"
TEST_PASSWORD = "Test1234!"
TEST_NAME     = "Test User"

# ─── 1. SIGNUP ────────────────────────────────────────────

def test_signup():
    response = requests.post(f"{BASE_URL}/signup", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "full_name": TEST_NAME
    })
    print_result("SIGNUP — new user", response)
    return response.status_code == 201


def test_signup_duplicate():
    response = requests.post(f"{BASE_URL}/signup", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "full_name": TEST_NAME
    })
    print_result("SIGNUP — duplicate email (should fail)", response)
    return response.status_code == 400


def test_signup_missing_fields():
    response = requests.post(f"{BASE_URL}/signup", json={
        "email": TEST_EMAIL
    })
    print_result("SIGNUP — missing fields (should fail)", response)
    return response.status_code == 400


# ─── 2. LOGIN ─────────────────────────────────────────────

def test_login():
    response = requests.post(f"{BASE_URL}/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    print_result("LOGIN — correct credentials", response)
    if response.status_code == 200:
        token = response.json().get("token")
        print(f"\n   ✅ Token received: {token[:40]}...")
        return token
    return None


def test_login_wrong_password():
    response = requests.post(f"{BASE_URL}/login", json={
        "email": TEST_EMAIL,
        "password": "wrongpassword"
    })
    print_result("LOGIN — wrong password (should fail)", response)
    return response.status_code == 401


def test_login_wrong_email():
    response = requests.post(f"{BASE_URL}/login", json={
        "email": "notexist@studygpt.com",
        "password": TEST_PASSWORD
    })
    print_result("LOGIN — wrong email (should fail)", response)
    return response.status_code == 401


# ─── 3. GET ME ────────────────────────────────────────────

def test_get_me(token):
    response = requests.get(f"{BASE_URL}/me", headers={
        "Authorization": f"Bearer {token}"
    })
    print_result("GET /me — valid token", response)
    return response.status_code == 200


def test_get_me_no_token():
    response = requests.get(f"{BASE_URL}/me")
    print_result("GET /me — no token (should fail)", response)
    return response.status_code == 401


def test_get_me_invalid_token():
    response = requests.get(f"{BASE_URL}/me", headers={
        "Authorization": "Bearer faketoken123"
    })
    print_result("GET /me — invalid token (should fail)", response)
    return response.status_code == 401


# ─── 4. GOOGLE AUTH ───────────────────────────────────────

def test_google_no_token():
    # We cannot generate a real Google token locally
    # This test confirms the endpoint exists and rejects fake tokens
    response = requests.post(f"{BASE_URL}/google", json={
        "google_token": "fake_google_token_for_local_test"
    })
    print_result("GOOGLE AUTH — fake token (should fail with 401)", response)
    return response.status_code == 401


def test_google_missing_token():
    response = requests.post(f"{BASE_URL}/google", json={})
    print_result("GOOGLE AUTH — missing token (should fail with 400)", response)
    return response.status_code == 400


# ─── RUN ALL TESTS ────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "="*50)
    print("   StudyGPT — AUTH MODULE TESTS")
    print("="*50)

    results = {}

    # Signup tests
    results["Signup new user"]         = test_signup()
    results["Signup duplicate"]        = test_signup_duplicate()
    results["Signup missing fields"]   = test_signup_missing_fields()

    # Login tests
    token = test_login()
    results["Login correct"]           = token is not None
    results["Login wrong password"]    = test_login_wrong_password()
    results["Login wrong email"]       = test_login_wrong_email()

    # Get me tests
    if token:
        results["Get me valid token"]  = test_get_me(token)
    results["Get me no token"]         = test_get_me_no_token()
    results["Get me invalid token"]    = test_get_me_invalid_token()

    # Google tests
    results["Google fake token"]       = test_google_no_token()
    results["Google missing token"]    = test_google_missing_token()

    # ─── SUMMARY ──────────────────────────────────────────
    print("\n" + "="*50)
    print("   RESULTS SUMMARY")
    print("="*50)
    passed = 0
    failed = 0
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} — {test}")
        if result:
            passed += 1
        else:
            failed += 1

    print(f"\n   Total: {passed} passed, {failed} failed")
    print("="*50)