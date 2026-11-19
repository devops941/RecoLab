from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_db, get_current_user
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, RefreshTokenRequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.register(user_in)


@router.post("/login", response_model=TokenResponse)
async def login(login_in: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.login(login_in)


@router.post("/refresh")
async def refresh_token(req: RefreshTokenRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh_token(req.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user.get("role", "Data Analyst"),
        is_active=current_user.get("is_active", True),
        created_at=current_user["created_at"],
        last_login=current_user.get("last_login")
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Successfully logged out."}
