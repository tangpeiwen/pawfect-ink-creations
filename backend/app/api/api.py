from fastapi import APIRouter
from backend.app.api.endpoints import users, auth, generator, tokens

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(generator.router, prefix="/generator", tags=["generator"])
api_router.include_router(tokens.router, prefix="/tokens", tags=["tokens"]) 