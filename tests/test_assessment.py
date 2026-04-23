import requests
import json

BASE_URL = "http://localhost:5000/api"
TOKEN = ""
LECTURE_ID = ""
SESSION_ID = ""


def print_result(test_name, response):
    print(f"\n{'='*50}")
    print(f"🔍 {test_name}")
    print(f"   Status Code : {response.status_code}")
    try:
        data = response.json()
        text = json.dumps(data, indent=2, ensure_ascii=False)
        print(f"   Response    : {text[:400]}")
    except:
        print(f"   Response    : {response.text[:300]}")
    print(f"{'='*50}")


def login():
    global TOKEN
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "testuser@studygpt.com",
        "password": "Test1234!"
    })
    if response.status_code == 200:
        TOKEN = response.json().get("token")
        print(f"\n✅ Logged in.")
    else:
        print(f"\n❌ Login failed.")
        exit()


def auth_headers():
    return {"Authorization": f"Bearer {TOKEN}"}


def get_existing_data():
    global LECTURE_ID, SESSION_ID
    
    # Get lecture
    response = requests.get(f"{BASE_URL}/upload/lectures", headers=auth_headers())
    if response.status_code == 200:
        lectures = response.json().get("lectures", [])
        if lectures:
            LECTURE_ID = lectures[0]["id"]
            print(f"\n✅ Using lecture_id={LECTURE_ID}")
        else:
            print("\n❌ No lectures found. Upload one first.")
            return False
    
    # Get session
    response = requests.get(f"{BASE_URL}/quiz/history/{LECTURE_ID}", headers=auth_headers())
    if response.status_code == 200:
        attempts = response.json().get("attempts", [])
        if attempts:
            SESSION_ID = attempts[0]["session_id"]
            print(f"✅ Using session_id={SESSION_ID}")
            return True
        else:
            print("\n⚠️  No quiz sessions found. Take a quiz first.")
            return False
    
    return False


# ─── ASSESSMENT TESTS ─────────────────────────────────────

def test_session_result():
    response = requests.get(
        f"{BASE_URL}/assessment/result/{SESSION_ID}",
        headers=auth_headers()
    )
    print_result("ASSESSMENT — session result", response)
    return response.status_code == 200


def test_lecture_progress():
    response = requests.get(
        f"{BASE_URL}/assessment/progress/{LECTURE_ID}",
        headers=auth_headers()
    )
    print_result("ASSESSMENT — lecture progress", response)
    return response.status_code == 200


def test_dashboard():
    response = requests.get(
        f"{BASE_URL}/assessment/dashboard",
        headers=auth_headers()
    )
    print_result("ASSESSMENT — dashboard", response)
    return response.status_code == 200


def test_session_not_found():
    response = requests.get(
        f"{BASE_URL}/assessment/result/00000000-0000-0000-0000-000000000000",
        headers=auth_headers()
    )
    print_result("ASSESSMENT — session not found (should fail)", response)
    return response.status_code == 404


def test_lecture_not_found():
    response = requests.get(
        f"{BASE_URL}/assessment/progress/00000000-0000-0000-0000-000000000000",
        headers=auth_headers()
    )
    print_result("ASSESSMENT — lecture not found (should fail)", response)
    return response.status_code == 404


# ─── RECOMMENDATION TESTS ─────────────────────────────────

def test_recommendations():
    response = requests.get(
        f"{BASE_URL}/recommendation/{LECTURE_ID}",
        headers=auth_headers()
    )
    print_result("RECOMMENDATION — get recommendations", response)
    return response.status_code == 200


def test_recommendations_not_found():
    response = requests.get(
        f"{BASE_URL}/recommendation/00000000-0000-0000-0000-000000000000",
        headers=auth_headers()
    )
    print_result("RECOMMENDATION — lecture not found (should fail)", response)
    return response.status_code == 404


def test_no_token():
    response = requests.get(f"{BASE_URL}/assessment/dashboard")
    print_result("ASSESSMENT — no token (should fail)", response)
    return response.status_code == 401


# ─── RUN ALL ──────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "="*50)
    print("   StudyGPT — ASSESSMENT + RECOMMENDATION TESTS")
    print("="*50)

    login()

    if not get_existing_data():
        print("\n❌ Cannot run tests without data. Exiting.")
        exit()

    results = {}
    
    # Assessment tests
    results["Session result"]           = test_session_result()
    results["Lecture progress"]         = test_lecture_progress()
    results["Dashboard"]                = test_dashboard()
    results["Session not found"]        = test_session_not_found()
    results["Lecture not found"]        = test_lecture_not_found()
    
    # Recommendation tests
    results["Recommendations"]          = test_recommendations()
    results["Recommendations not found"]= test_recommendations_not_found()
    
    # Auth tests
    results["No token"]                 = test_no_token()

    print("\n" + "="*50)
    print("   RESULTS SUMMARY")
    print("="*50)
    passed = failed = 0
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} — {test}")
        if result: passed += 1
        else: failed += 1

    print(f"\n   Total: {passed} passed, {failed} failed")
    print("="*50)