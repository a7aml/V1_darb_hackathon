import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

# ─── IMPORT CLIENT ────────────────────────────────────────
try:
    from app.shared.openai_client import generate, embed, embed_query
    print("✅ OpenAI client imported successfully")
except Exception as e:
    print(f"❌ Failed to import client: {str(e)}")
    exit()


def print_result(test_name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{'='*50}")
    print(f"🔍 {test_name}")
    print(f"   Status : {status}")
    if details:
        print(f"   Details: {details}")
    print(f"{'='*50}")


# ─── TEST 1: GENERATE ─────────────────────────────────────

def test_generate_basic():
    try:
        response = generate("Say hello in one sentence.")
        passed = isinstance(response, str) and len(response) > 0
        print_result(
            "GENERATE — basic prompt",
            passed,
            f"Response: {response[:100]}"
        )
        return passed
    except Exception as e:
        print_result("GENERATE — basic prompt", False, str(e))
        return False


def test_generate_with_system_prompt():
    try:
        response = generate(
            prompt="What is machine learning?",
            system_prompt="You are a teacher. Reply in one sentence only."
        )
        passed = isinstance(response, str) and len(response) > 0
        print_result(
            "GENERATE — with system prompt",
            passed,
            f"Response: {response[:100]}"
        )
        return passed
    except Exception as e:
        print_result("GENERATE — with system prompt", False, str(e))
        return False


def test_generate_arabic():
    try:
        response = generate(
            prompt="ما هو التعلم الآلي؟",
            system_prompt="أجب باللغة العربية فقط في جملة واحدة."
        )
        passed = isinstance(response, str) and len(response) > 0
        print_result(
            "GENERATE — Arabic response",
            passed,
            f"Response: {response[:100]}"
        )
        return passed
    except Exception as e:
        print_result("GENERATE — Arabic response", False, str(e))
        return False


def test_generate_json():
    try:
        response = generate(
            prompt="Give me 2 MCQ questions about AI. Return as JSON array with fields: question, options, answer.",
            system_prompt="Return only valid JSON. No extra text."
        )
        passed = isinstance(response, str) and len(response) > 0
        print_result(
            "GENERATE — JSON output",
            passed,
            f"Response: {response[:150]}"
        )
        return passed
    except Exception as e:
        print_result("GENERATE — JSON output", False, str(e))
        return False


# ─── TEST 2: EMBED ────────────────────────────────────────

def test_embed_basic():
    try:
        vector = embed("Machine learning is a subset of artificial intelligence.")
        passed = isinstance(vector, list) and len(vector) == 1536
        print_result(
            "EMBED — basic text",
            passed,
            f"Vector size: {len(vector)} | First 3 values: {vector[:3]}"
        )
        return passed
    except Exception as e:
        print_result("EMBED — basic text", False, str(e))
        return False


def test_embed_arabic():
    try:
        vector = embed("التعلم الآلي هو فرع من فروع الذكاء الاصطناعي.")
        passed = isinstance(vector, list) and len(vector) == 1536
        print_result(
            "EMBED — Arabic text",
            passed,
            f"Vector size: {len(vector)} | First 3 values: {vector[:3]}"
        )
        return passed
    except Exception as e:
        print_result("EMBED — Arabic text", False, str(e))
        return False


def test_embed_empty():
    try:
        vector = embed("")
        print_result("EMBED — empty text (edge case)", False, "Should have raised error")
        return False
    except Exception as e:
        print_result(
            "EMBED — empty text (edge case)",
            True,
            f"Raised exception as expected: {str(e)[:80]}"
        )
        return True


# ─── TEST 3: EMBED QUERY ──────────────────────────────────

def test_embed_query_basic():
    try:
        vector = embed_query("What is supervised learning?")
        passed = isinstance(vector, list) and len(vector) == 1536
        print_result(
            "EMBED QUERY — basic question",
            passed,
            f"Vector size: {len(vector)} | First 3 values: {vector[:3]}"
        )
        return passed
    except Exception as e:
        print_result("EMBED QUERY — basic question", False, str(e))
        return False


def test_embed_similarity():
    try:
        import math

        def cosine_similarity(v1, v2):
            dot  = sum(a*b for a, b in zip(v1, v2))
            mag1 = math.sqrt(sum(a**2 for a in v1))
            mag2 = math.sqrt(sum(b**2 for b in v2))
            return dot / (mag1 * mag2)

        v1 = embed("Neural networks are used in deep learning.")
        v2 = embed("Deep learning uses neural network architectures.")
        v3 = embed("The weather today is sunny and warm.")

        sim_related   = cosine_similarity(v1, v2)
        sim_unrelated = cosine_similarity(v1, v3)

        passed = sim_related > sim_unrelated
        print_result(
            "EMBED — similarity check",
            passed,
            f"Related: {sim_related:.4f} | Unrelated: {sim_unrelated:.4f}"
        )
        return passed
    except Exception as e:
        print_result("EMBED — similarity check", False, str(e))
        return False


# ─── RUN ALL ──────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "="*50)
    print("   StudyGPT — OPENAI CLIENT TESTS")
    print("="*50)

    results = {}
    results["Generate basic"]          = test_generate_basic()
    results["Generate with system"]    = test_generate_with_system_prompt()
    results["Generate Arabic"]         = test_generate_arabic()
    results["Generate JSON output"]    = test_generate_json()
    results["Embed basic"]             = test_embed_basic()
    results["Embed Arabic"]            = test_embed_arabic()
    results["Embed empty"]             = test_embed_empty()
    results["Embed query"]             = test_embed_query_basic()
    results["Embed similarity check"]  = test_embed_similarity()

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