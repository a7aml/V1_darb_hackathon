import requests
import json

BASE_URL = "http://localhost:5000/api"
TOKEN = ""
LECTURE_ID = ""


def login():
    global TOKEN
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "testuser@studygpt.com",
        "password": "Test1234!"
    })
    TOKEN = response.json().get("token")
    print("✅ Logged in")


def get_lecture():
    global LECTURE_ID
    response = requests.get(f"{BASE_URL}/upload/lectures", headers={"Authorization": f"Bearer {TOKEN}"})
    lectures = response.json().get("lectures", [])
    if lectures:
        LECTURE_ID = lectures[0]["id"]
        print(f"✅ Using lecture_id={LECTURE_ID}")
        return True
    return False


def test_ask():
    response = requests.post(
        f"{BASE_URL}/chatbot/ask",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={
            "lecture_id": LECTURE_ID,
            "message": "Explain what is machine learning"
        }
    )
    print(json.dumps(response.json(), indent=2))
    return response.status_code == 200


if __name__ == "__main__":
    login()
    if get_lecture():
        test_ask()