import json
import logging
from dataclasses import dataclass
from typing import Optional

import firebase_admin
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from app.config import Settings, get_settings

logger = logging.getLogger("skillpath.auth")
bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    uid: str
    email: Optional[str]
    email_verified: bool
    is_demo: bool = False


def init_firebase_admin(settings: Settings) -> None:
    if firebase_admin._apps:
        return
    try:
        if settings.firebase_credentials_json.strip():
            cert_dict = json.loads(settings.firebase_credentials_json)
            cred = credentials.Certificate(cert_dict)
            firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id})
        else:
            # Uses Application Default Credentials or projectId metadata
            firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
        logger.info("Firebase Admin SDK initialized for project %s", settings.firebase_project_id)
    except Exception as exc:
        logger.warning("Firebase Admin initialization deferred/limited: %s", exc)


async def get_current_user(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> AuthenticatedUser:
    # Reject any attempt by client to pass a Gemini API key in headers
    forbidden_headers = {"x-gemini-api-key", "x-api-key"}
    if any(h.lower() in forbidden_headers for h in request.headers.keys()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client-supplied AI API keys are forbidden. Server manages Gemini credentials securely.",
        )

    if creds is None or not creds.credentials:
        if settings.allow_demo_bypass and settings.environment != "production":
            return AuthenticatedUser(
                uid="demo_student_alex",
                email="alex.demo@skillpath.local",
                email_verified=True,
                is_demo=True,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Firebase Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    init_firebase_admin(settings)
    token = creds.credentials.strip()
    try:
        decoded = firebase_auth.verify_id_token(token, check_revoked=False)
        uid = decoded.get("uid") or decoded.get("sub")
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token payload.",
            )
        return AuthenticatedUser(
            uid=str(uid),
            email=decoded.get("email"),
            email_verified=bool(decoded.get("email_verified", False)),
            is_demo=False,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Firebase token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
