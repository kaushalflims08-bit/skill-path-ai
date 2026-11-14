from fastapi.testclient import TestClient

from app.auth import AuthenticatedUser, get_current_user
from app.main import app
from app.services.rate_limiter import rate_limiter

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert "mode" in data


def test_unauthenticated_request_rejected():
    app.dependency_overrides.clear()
    res = client.post(
        "/api/v1/mentor/chat",
        json={"message": "Explain React hooks", "mode": "Explain", "language": "English"},
    )
    assert res.status_code == 401


def test_client_supplied_gemini_key_rejected():
    res = client.post(
        "/api/v1/mentor/chat",
        headers={"x-gemini-api-key": "AIzaSyFakeKey"},
        json={"message": "Explain closures"},
    )
    assert res.status_code == 400


def test_six_agent_orchestrator_with_verified_user():
    async def mock_user() -> AuthenticatedUser:
        return AuthenticatedUser(uid="uid_student_1", email="student@college.edu", email_verified=True)

    app.dependency_overrides[get_current_user] = mock_user
    try:
        payload = {
            "full_name": "Alex Rivera",
            "target_career_id": "full-stack-developer",
            "target_career_title": "Full Stack Developer",
            "weekly_study_hours": 10,
            "preferred_language": "English",
            "preferred_learning_style": "hands-on",
            "self_reported_skills": [{"skill": "JavaScript", "rating": 75}],
            "verified_skills": [{"skill": "JavaScript", "score": 20, "confidence": "low", "evidence_count": 1}],
            "career_requirements": [
                {"skill": "JavaScript", "required_score": 80, "importance": 5, "estimated_effort_hours": 15},
                {"skill": "SQL", "required_score": 70, "importance": 3, "estimated_effort_hours": 8},
            ],
            "recent_quiz_scores": [35],
            "weak_topics": ["JavaScript"],
        }
        res = client.post("/api/v1/agents/orchestrate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["user_id"] == "uid_student_1"
        assert len(data["steps"]) == 6
        assert any(m["is_remediation"] for m in data["learning_planner"]["modules"])
        assert "JavaScript" in data["skill_analysis"]["weak_skills"]
    finally:
        app.dependency_overrides.clear()


def test_assessment_repeated_struggle_switches_format():
    async def mock_user() -> AuthenticatedUser:
        return AuthenticatedUser(uid="uid_student_2", email="student2@college.edu", email_verified=True)

    app.dependency_overrides[get_current_user] = mock_user
    try:
        res = client.post(
            "/api/v1/assessments/analyze",
            json={
                "title": "JavaScript Diagnostic",
                "score_percentage": 30,
                "topics": ["JavaScript"],
                "weak_topics": ["JavaScript"],
                "prior_fail_counts": {"JavaScript": 1},
                "current_learning_style": "hands-on",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["action"] == "switch_format_remediation"
        assert data["recommended_format"] == "video"
    finally:
        app.dependency_overrides.clear()


def test_rate_limiter_enforces_429():
    rate_limiter._buckets.clear()
    rate_limiter.check("uid_rl", max_requests=2, window_seconds=60)
    rate_limiter.check("uid_rl", max_requests=2, window_seconds=60)
    try:
        rate_limiter.check("uid_rl", max_requests=2, window_seconds=60)
        assert False, "Expected HTTP 429"
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 429
