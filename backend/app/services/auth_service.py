from datetime import datetime, timezone
from typing import Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def register(self, user_in: UserRegister) -> TokenResponse:
        existing = await self.db.users.find_one({"email": user_in.email.lower()})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        user_doc = {
            "email": user_in.email.lower(),
            "full_name": user_in.full_name,
            "hashed_password": get_password_hash(user_in.password),
            "role": user_in.role or "Data Analyst",
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "last_login": datetime.now(timezone.utc)
        }
        res = await self.db.users.insert_one(user_doc)
        user_id = str(res.inserted_id)

        user_resp = UserResponse(
            id=user_id,
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            role=user_doc["role"],
            is_active=True,
            created_at=user_doc["created_at"],
            last_login=user_doc["last_login"]
        )

        access_token = create_access_token(user_id, role=user_doc["role"])
        refresh_token = create_refresh_token(user_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=3600,
            user=user_resp
        )

    async def login(self, login_in: UserLogin) -> TokenResponse:
        user = await self.db.users.find_one({"email": login_in.email.lower()})
        if not user or not verify_password(login_in.password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated."
            )

        user_id = str(user["_id"])
        await self.db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )

        user_resp = UserResponse(
            id=user_id,
            email=user["email"],
            full_name=user["full_name"],
            role=user.get("role", "Data Analyst"),
            is_active=user.get("is_active", True),
            created_at=user.get("created_at", datetime.now(timezone.utc)),
            last_login=datetime.now(timezone.utc)
        )

        access_token = create_access_token(user_id, role=user_resp.role)
        refresh_token = create_refresh_token(user_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=3600,
            user=user_resp
        )

    async def refresh_token(self, refresh_tok: str) -> Dict[str, Any]:
        payload = decode_token(refresh_tok)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )
        user_id = payload.get("sub")
        user = await self.db.users.find_one({"_id": ObjectId(user_id)})
        if not user or not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive."
            )

        new_access = create_access_token(user_id, role=user.get("role", "Viewer"))
        new_refresh = create_refresh_token(user_id)
        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "expires_in": 3600
        }
