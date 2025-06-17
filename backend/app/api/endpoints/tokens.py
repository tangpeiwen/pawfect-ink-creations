from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.services.db_service import DBService
from backend.models.schemas import TokenPackage, TokenTransaction
from backend.models.token_schemas import TokenPackageCreate, TokenTransactionCreate

router = APIRouter()
db_service = DBService()

@router.get("/packages", response_model=List[TokenPackage])
async def get_token_packages():
    """获取所有token套餐"""
    return await db_service.get_token_packages()

@router.post("/purchase")
async def purchase_tokens(
    package_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """购买token套餐"""
    # 获取套餐信息
    package = await db_service.get_token_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="套餐不存在")
    
    # TODO: 调用支付接口
    
    # 增加用户token
    await db_service.add_tokens(
        user_id=user_id,
        amount=package.token_amount,
        description=f"购买套餐: {package.name}",
        package_id=package_id
    )
    
    return {"message": "购买成功"}

@router.get("/transactions", response_model=List[TokenTransaction])
async def get_token_transactions(
    user_id: int,
    skip: int = 0,
    limit: int = 10
):
    """获取用户token交易记录"""
    return await db_service.get_token_transactions(
        user_id=user_id,
        skip=skip,
        limit=limit
    ) 