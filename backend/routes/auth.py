from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os

from backend.core.config import settings
from backend.database.connection import get_db
from backend.models.usuario import Usuario
from backend.core.security import verificar_senha

router = APIRouter(tags=["Autenticação"])

REFRESH_TOKEN_EXPIRE_HOURS = 24

def criar_token(dados: dict, expires_delta: timedelta, token_type: str):
    to_encode = dados.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "token_type": token_type})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt, expire

# ---------------------------- LOGIN ---------------------------- #
@router.post("/token")
async def login(response: Response, request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Usuario).filter(Usuario.username == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verificar_senha(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

    access_token, exp_access = criar_token(
        {"sub": user.username, "role": user.role},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "access"
    )

    refresh_token, exp_refresh = criar_token(
        {
            "sub": user.username, 
            "role": user.role,
            "ip": request.client.host,
            "agent": request.headers.get("user-agent", "unknown")
        },
        timedelta(hours=REFRESH_TOKEN_EXPIRE_HOURS),
        "refresh"
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_HOURS * 3600,
        expires=REFRESH_TOKEN_EXPIRE_HOURS * 3600,
        samesite="lax",
        secure=False
    )

    return {
        "access_token": access_token,
        "expires_in": int(exp_access.timestamp()),
        "token_type": "bearer",
        "role": user.role
    }

# --------------------------- REFRESH --------------------------- #
@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token ausente")

    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("token_type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
        
        username = payload.get("sub")
        role = payload.get("role")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

    access_token, exp_access = criar_token(
        {"sub": username, "role": role},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "access"
    )

    return {
        "access_token": access_token,
        "expires_in": int(exp_access.timestamp()),
        "token_type": "bearer"
    }

# ---------------------------- LOGOUT ---------------------------- #
@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="refresh_token", path="/")
    return {"detail": "Logout realizado com sucesso"}