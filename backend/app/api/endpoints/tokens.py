from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from app.services.database import db_service
from app.services.zpay_service import ZpayService
from app.models.schemas import OrderCreate, OrderCreateResponse
from app.models.token_schemas import TokenPackage, TokenTransaction, TokenPackageCreate, TokenTransactionCreate, TokenBalanceResponse
from app.core.auth import get_current_user_id
from app.core.config import settings
from app.utils.helpers import generate_order_id
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
zpay_service = ZpayService()

@router.get("/packages", response_model=List[TokenPackage])
async def get_token_packages():
    """获取所有token套餐"""
    return await db_service.get_token_packages()

@router.post("/purchase", response_model=OrderCreateResponse)
async def purchase_tokens(
    request: OrderCreate,
    client_request: Request,
    current_user_id: str = Depends(get_current_user_id)
):
    """购买token套餐 - 创建支付订单"""
    try:
        # 获取套餐信息
        package = await db_service.get_token_package(request.package_id)
        if not package:
            raise HTTPException(status_code=404, detail="套餐不存在")
        
        # 生成订单号
        order_id = generate_order_id()
        
        # 创建订单
        order_data = {
            "id": order_id,
            "user_id": current_user_id,
            "package_id": request.package_id,
            "amount": package["price_rmb"],
            "token_amount": package["tokens"],
            "status": "pending"
        }
        
        order = await db_service.create_order(order_data)
        
        # 配置回调地址
        notify_url = f"{settings.PAYMENT_DOMAIN}/api/orders/notify"
        return_url = f"{settings.FRONTEND_DOMAIN}/payment/result"
        
        # 获取客户端IP
        client_ip = client_request.client.host if client_request.client else "127.0.0.1"
        
        # 金额处理：分转为元
        payment_amount = package["price_rmb"] / 100
        
        # 创建支付订单
        payment_result = await zpay_service.create_api_order(
            order_id=order_id,
            amount=payment_amount,
            notify_url=notify_url,
            return_url=return_url,
            client_ip=client_ip,
            device="pc"
        )
        
        if not payment_result["success"]:
            # 支付创建失败，更新订单状态
            await db_service.update_order(order_id, {
                "status": "failed",
                "error_message": payment_result["message"]
            })
            raise HTTPException(status_code=500, detail=payment_result["message"])
        
        # 更新订单支付信息
        await db_service.update_order(order_id, {
            "payment_id": payment_result.get("trade_no"),
            "extra": {
                "pay_url": payment_result["pay_url"],
                "qr_code": payment_result.get("qrcode"),
                "qr_img": payment_result.get("img")
            }
        })
        
        return_data = {
            **order,
            "pay_url": payment_result["pay_url"],
            "qr_code": payment_result.get("qrcode"),
            "qr_img": payment_result.get("img")
        }
        
        return return_data

    except Exception as e:
        logger.error(f"创建Token购买订单失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"创建订单失败: {str(e)}")

@router.get("/transactions", response_model=List[TokenTransaction])
async def get_token_transactions(
    current_user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 10
):
    """获取用户token交易记录"""
    return await db_service.get_token_transactions(
        user_id=current_user_id,
        skip=skip,
        limit=limit
    )

@router.get("/balance", response_model=TokenBalanceResponse)
async def get_token_balance(current_user_id: str = Depends(get_current_user_id)):
    """获取用户token余额"""
    try:
        user_profile = await db_service.get_user_profile(current_user_id)
        if not user_profile:
            raise HTTPException(status_code=404, detail="用户资料不存在")
        
        tokens_remaining = user_profile.get('tokens_remaining', 0)
        
        return TokenBalanceResponse(
            success=True,
            tokens_remaining=tokens_remaining,
            message=f"当前余额: {tokens_remaining} Token"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"获取token余额失败: {str(e)}"
        ) 