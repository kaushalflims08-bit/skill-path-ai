from fastapi import APIRouter, Depends

from app.auth import AuthenticatedUser
from app.config import Settings, get_settings
from app.orchestrator import run_six_agent_orchestrator
from app.schemas.agents import OrchestratorRequest, OrchestratorResponse
from app.services.gemini_service import GeminiStructuredClient
from app.services.rate_limiter import enforce_rate_limit

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])


@router.post("/orchestrate", response_model=OrchestratorResponse)
async def orchestrate_agents(
    payload: OrchestratorRequest,
    user: AuthenticatedUser = Depends(enforce_rate_limit),
    settings: Settings = Depends(get_settings),
) -> OrchestratorResponse:
    client = GeminiStructuredClient(settings)
    return await run_six_agent_orchestrator(
        user_id=user.uid,
        req=payload,
        gemini_client=client,
    )
