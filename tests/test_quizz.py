import requests
import json
import os

BASE_URL   = "http://localhost:5000/api"
TOKEN      = ""
LECTURE_ID = ""
QUIZ_ID    = ""
QUESTIONS  = []


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


# ─── LOGIN ────────────────────────────────────────────────

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


# ─── GET EXISTING LECTURE ─────────────────────────────────

def get_existing_lecture():
    global LECTURE_ID
    response = requests.get(f"{BASE_URL}/upload/lectures", headers=auth_headers())
    if response.status_code == 200:
        lectures = response.json().get("lectures", [])
        if lectures:
            LECTURE_ID = lectures[0]["id"]
            print(f"\n✅ Using lecture_id={LECTURE_ID}")
            return True
    print(f"\n❌ No lectures found. Upload a lecture first.")
    return False


# ─── TESTS ────────────────────────────────────────────────

def test_generate_mcq():
    global QUIZ_ID, QUESTIONS
    response = requests.post(
        f"{BASE_URL}/quiz/generate",
        headers=auth_headers(),
        json={
            "lecture_id": LECTURE_ID,
            "type": "mcq",
            "difficulty": "medium",
            "num_questions": 3,
            "slide_number": None
        }
    )
    print_result("QUIZ — generate MCQ", response)
    if response.status_code == 201:
        QUIZ_ID   = response.json().get("quiz_id")
        QUESTIONS = response.json().get("questions", [])
    return response.status_code == 201


def test_generate_true_false():
    response = requests.post(
        f"{BASE_URL}/quiz/generate",
        headers=auth_headers(),
        json={
            "lecture_id": LECTURE_ID,
            "type": "true_false",
            "difficulty": "easy",
            "num_questions": 3,
            "slide_number": None
        }
    )
    print_result("QUIZ — generate True/False", response)
    return response.status_code == 201


def test_generate_specific_slide():
    response = requests.post(
        f"{BASE_URL}/quiz/generate",
        headers=auth_headers(),
        json={
            "lecture_id": LECTURE_ID,
            "type": "mcq",
            "difficulty": "hard",
            "num_questions": 2,
            "slide_number": 1
        }
    )
    print_result("QUIZ — generate for specific slide", response)
    return response.status_code == 201


def test_generate_invalid_type():
    response = requests.post(
        f"{BASE_URL}/quiz/generate",
        headers=auth_headers(),
        json={
            "lecture_id": LECTURE_ID,
            "type": "invalid_type",
            "difficulty": "medium",
            "num_questions": 3
        }
    )
    print_result("QUIZ — invalid type (should fail)", response)
    return response.status_code == 400


def test_generate_invalid_difficulty():
    response = requests.post(
        f"{BASE_URL}/quiz/generate",
        headers=auth_headers(),
        json={
            "lecture_id": LECTURE_ID,
            "type": "mcq",
            "difficulty": "super_hard",
            "num_questions": 3
        }
    )
    print_result("QUIZ — invalid difficulty (should fail)", response)
    return response.status_code == 400


def test_generate_too_many_questions():
    response = requests.post(
        f"{BASE_URL}/quiz/generate",
        headers=auth_headers(),
        json={
            "lecture_id": LECTURE_ID,
            "type": "mcq",
            "difficulty": "medium",
            "num_questions": 100
        }
    )
    print_result("QUIZ — too many questions (should fail)", response)
    return response.status_code == 400


def test_submit_quiz():
    if not QUIZ_ID or not QUESTIONS:
        print("\n⚠️  No quiz to submit. Skipping.")
        return False

    # Build answers (answer first option for all questions)
    answers = []
    for q in QUESTIONS:
        answers.append({
            "question_id": q["id"],
            "answer": "A"
        })

    response = requests.post(
        f"{BASE_URL}/quiz/submit",
        headers=auth_headers(),
        json={
            "quiz_id":    QUIZ_ID,
            "lecture_id": LECTURE_ID,
            "time_taken": 120,
            "answers":    answers
        }
    )
    print_result("QUIZ — submit answers", response)
    return response.status_code == 200


def test_submit_no_answers():
    response = requests.post(
        f"{BASE_URL}/quiz/submit",
        headers=auth_headers(),
        json={
            "quiz_id":    QUIZ_ID,
            "lecture_id": LECTURE_ID,
            "time_taken": 0,
            "answers":    []
        }
    )
    print_result("QUIZ — submit no answers (should fail)", response)
    return response.status_code == 400


def test_get_history():
    response = requests.get(
        f"{BASE_URL}/quiz/history/{LECTURE_ID}",
        headers=auth_headers()
    )
    print_result("QUIZ — get history", response)
    return response.status_code == 200


def test_no_token():
    response = requests.post(
        f"{BASE_URL}/quiz/generate",
        json={"lecture_id": LECTURE_ID, "type": "mcq", "difficulty": "easy", "num_questions": 3}
    )
    print_result("QUIZ — no token (should fail)", response)
    return response.status_code == 401


# ─── RUN ALL ──────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "="*50)
    print("   StudyGPT — QUIZ MODULE TESTS")
    print("="*50)

    login()

    if not get_existing_lecture():
        exit()

    results = {}
    results["Generate MCQ"]               = test_generate_mcq()
    results["Generate True/False"]        = test_generate_true_false()
    results["Generate specific slide"]    = test_generate_specific_slide()
    results["Generate invalid type"]      = test_generate_invalid_type()
    results["Generate invalid difficulty"]= test_generate_invalid_difficulty()
    results["Generate too many questions"]= test_generate_too_many_questions()
    results["Submit quiz"]                = test_submit_quiz()
    results["Submit no answers"]          = test_submit_no_answers()
    results["Get history"]                = test_get_history()
    results["No token"]                   = test_no_token()

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