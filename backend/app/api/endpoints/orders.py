from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse
from app.models.schemas import OrderCreate, OrderResponse, OrderCreateResponse, ProductOrderCreate, ProductOrderResponse
from app.services.database import db_service
from app.services.zpay_service import ZpayService
from app.core.auth import get_current_user_id
from app.core.config import settings
from app.utils.helpers import generate_order_id
import logging
from datetime import datetime
from typing import Dict

router = APIRouter()
logger = logging.getLogger(__name__)
zpay_service = ZpayService()

@router.post("/create", response_model=OrderCreateResponse)
async def create_order(
    request: OrderCreate,
    client_request: Request,
    current_user_id: str = Depends(get_current_user_id)
):
    """创建订单"""
    try:
        # 获取套餐信息（直接使用字符串ID）
        package = await db_service.get_token_package(request.package_id)
        if not package:
            raise HTTPException(status_code=404, detail="套餐不存在")
        
        # 生成订单号
        order_id = generate_order_id()
        
        # 创建订单（使用正确的字段名）
        order_data = {
            "id": order_id,
            "user_id": current_user_id,
            "package_id": request.package_id,
            "amount": package["price_rmb"],  # 使用正确的字段名
            "token_amount": package["tokens"],  # 使用正确的字段名
            "status": "pending"
        }
        
        order = await db_service.create_order(order_data)
        
        # 配置回调地址
        notify_url = f"{settings.PAYMENT_DOMAIN}/api/orders/notify"
        return_url = f"{settings.FRONTEND_DOMAIN}/payment/result"  # 支付完成后跳转到前端页面
        
        # 统一使用API支付，不区分设备类型
        client_ip = client_request.client.host if client_request.client else "127.0.0.1"
        
        # 金额处理：确保金额单位一致，以元为单位发送给支付接口
        payment_amount = package["price_rmb"]/100  # 分转为元
        
        payment_result = await zpay_service.create_api_order(
            order_id=order_id,
            amount=payment_amount,
            notify_url=notify_url,
            return_url=return_url,
            client_ip=client_ip,
            device="pc"  # 统一使用pc模式
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
        logger.error(f"创建订单失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"创建订单失败: {str(e)}")

@router.get("/test-notify")
async def test_notify():
    """测试回调接口是否可访问"""
    return {"message": "回调接口正常", "timestamp": datetime.now()}

@router.post("/notify")
@router.get("/notify")
async def payment_notify(request: Request):
    """支付回调通知（支持GET和POST）"""
    try:
        # 获取回调参数（支持GET和POST）
        if request.method == "GET":
            notify_dict = dict(request.query_params)
        else:
            notify_params = await request.form()
            notify_dict = dict(notify_params)
        
        # 记录回调信息用于调试
        logger.info(f"收到支付回调({request.method}): {notify_dict}")
        
        # 检查是否有必要的回调参数
        required_params = ['pid', 'out_trade_no', 'trade_status', 'sign']
        missing_params = [param for param in required_params if not notify_dict.get(param)]
        if missing_params:
            error_msg = f"回调缺少必要参数: {missing_params}"
            logger.error(error_msg)
            return PlainTextResponse("fail", status_code=200)
        
        # 1. 验证签名
        if not zpay_service.verify_notify(notify_dict):
            logger.error(f"支付回调验签失败: {notify_dict}")
            return PlainTextResponse("fail", status_code=200)
        
        # 2. 获取订单信息
        order_id = notify_dict.get("out_trade_no")
        trade_status = notify_dict.get("trade_status")
        notify_money = notify_dict.get("money")  # 回调中的金额
        trade_no = notify_dict.get("trade_no")   # 支付平台订单号
        
        if not order_id:
            logger.error("回调缺少订单号")
            return PlainTextResponse("fail", status_code=200)
        
        # 3. 查询订单
        order = await db_service.get_order(order_id)
        if not order:
            logger.error(f"订单不存在: {order_id}")
            return PlainTextResponse("fail", status_code=200)
        
        # 4. 防止重复处理
        if order["status"] == "paid":
            logger.info(f"订单 {order_id} 已经处理过，跳过")
            return PlainTextResponse("success", status_code=200)
        
        # 5. 验证金额
        if notify_money:
            # 金额处理：确保金额单位一致，统一以元为单位进行比较
            expected_amount = order["amount"] / 100  # 将分转为元
            actual_amount = float(notify_money)
            
            logger.info(f"订单 {order_id} 金额验证 - 期望: {expected_amount}元, 实际: {actual_amount}元")
            
            if abs(expected_amount - actual_amount) > 0.01:  # 允许1分钱的误差
                error_msg = f"订单 {order_id} 金额不匹配: 期望 {expected_amount}元, 实际 {actual_amount}元"
                logger.error(error_msg)
                await db_service.update_order(order_id, {
                    "status": "failed",
                    "error_message": f"金额不匹配: 期望{expected_amount}元, 实际{actual_amount}元"
                })
                return PlainTextResponse("fail", status_code=200)
        
        # 6. 处理支付结果
        if trade_status == "TRADE_SUCCESS":
            # 更新订单状态
            update_result = await db_service.update_order(order_id, {
                "status": "paid",
                "paid_at": datetime.now().isoformat(),  # 转换为ISO格式字符串
                "payment_method": "zpay",
                "payment_id": trade_no,
                "extra": {
                    **order.get('extra', {}),
                    "notify_data": notify_dict  # 保存完整的回调数据
                }
            })
            
            # 给用户增加token
            try:
                token_result = await db_service.add_tokens(
                    user_id=order["user_id"],
                    amount=order["token_amount"],
                    description=f"购买Token套餐 - 订单{order_id}",
                    package_id=order["package_id"]
                )
                logger.info(f"订单 {order_id} 支付成功，已为用户 {order['user_id']} 增加 {order['token_amount']} tokens")
            except Exception as token_error:
                logger.error(f"订单 {order_id} 支付成功但增加token失败: {str(token_error)}")
                # 更新订单状态，标记token增加失败
                await db_service.update_order(order_id, {
                    "extra": {
                        **order.get('extra', {}),
                        "notify_data": notify_dict,
                        "token_add_error": str(token_error)  # 记录token增加失败的原因
                    }
                })
                # 仍然返回success，但记录了错误信息
            
            logger.info(f"订单 {order_id} 支付成功，金额: {notify_money}元")
            return PlainTextResponse("success", status_code=200)
        
        elif trade_status in ["TRADE_CLOSED", "TRADE_FINISHED"]:
            # 交易关闭或完成但不成功
            await db_service.update_order(order_id, {
                "status": "failed",
                "error_message": f"支付状态: {trade_status}",
                "extra": {
                    **order.get('extra', {}),
                    "notify_data": notify_dict
                }
            })
            
            logger.error(f"订单 {order_id} 支付失败: {trade_status}")
            return PlainTextResponse("success", status_code=200)  # 返回success避免重复回调
        
        else:
            # 其他状态，暂不处理
            logger.info(f"订单 {order_id} 状态: {trade_status}，暂不处理")
            return PlainTextResponse("success", status_code=200)
            
    except Exception as e:
        logger.error(f"处理支付回调失败: {str(e)}", exc_info=True)
        return PlainTextResponse("fail", status_code=200)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """获取订单详情"""
    try:
        order = await db_service.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")
            
        # 验证订单所属
        if order["user_id"] != current_user_id:
            raise HTTPException(status_code=403, detail="无权访问此订单")
            
        return order
        
    except Exception as e:
        logger.error(f"获取订单失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取订单失败: {str(e)}")

@router.get("/user/history")
async def get_order_history(
    current_user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 20
):
    """获取用户订单历史"""
    try:
        orders = await db_service.get_user_orders(
            user_id=current_user_id,
            skip=skip,
            limit=limit
        )
        return {
            "total": len(orders),
            "orders": orders
        }
    except Exception as e:
        logger.error(f"获取订单历史失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取订单历史失败: {str(e)}")

# ==================== 实物产品订单相关API ====================

@router.post("/product/create", response_model=ProductOrderResponse)
async def create_product_order(
    request: ProductOrderCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """创建实物产品订单"""
    try:
        logger.info(f"用户 {current_user_id} 开始创建实物产品订单")
        logger.info(f"订单详情: 产品类型={request.product_type}, 产品名称={request.product_name}, Token成本={request.token_cost}")
        
        # 验证产品类型
        if request.product_type not in ['sticker', 'tattoo']:
            raise HTTPException(status_code=400, detail="无效的产品类型")
        
        # 检查用户Token余额
        logger.info(f"检查用户 {current_user_id} 的Token余额")
        user_profile = await db_service.get_user_profile(current_user_id)
        if not user_profile:
            logger.error(f"用户 {current_user_id} 不存在")
            raise HTTPException(status_code=404, detail="用户不存在")
        
        current_tokens = user_profile.get('tokens_remaining', 0)
        logger.info(f"用户 {current_user_id} 当前Token余额: {current_tokens}, 需要: {request.token_cost}")
        
        if current_tokens < request.token_cost:
            logger.error(f"用户 {current_user_id} Token余额不足: 当前{current_tokens}, 需要{request.token_cost}")
            raise HTTPException(status_code=400, detail=f"Token余额不足，需要{request.token_cost}个Token，当前余额{current_tokens}个")
        
        # 生成订单ID
        order_id = generate_order_id()
        logger.info(f"生成订单ID: {order_id}")
        
        # 创建订单数据
        order_data = {
            "id": order_id,
            "user_id": current_user_id,
            "product_type": request.product_type,
            "product_name": request.product_name,
            "token_cost": request.token_cost,
            "design_image_url": request.design_image_url,
            "recipient_name": request.recipient_name,
            "recipient_phone": request.recipient_phone,
            "shipping_province": request.shipping_province,
            "shipping_city": request.shipping_city,
            "shipping_address": request.shipping_address,
            "shipping_zipcode": request.shipping_zipcode,
            "shipping_notes": request.shipping_notes,
            "status": "pending"
        }
        
        # 创建订单
        logger.info(f"创建订单记录: {order_id}")
        order = await db_service.create_product_order(order_data)
        logger.info(f"订单创建成功: {order_id}")
        
        # 扣除Token
        logger.info(f"开始扣除用户 {current_user_id} 的 {request.token_cost} 个Token")
        token_consumed = await db_service.consume_user_tokens(
            current_user_id, 
            request.token_cost, 
            f"制作{request.product_name}订单: {order_id}"
        )
        
        if not token_consumed:
            logger.error(f"扣除Token失败，订单 {order_id} 标记为失败")
            # 如果扣除Token失败，需要删除订单或标记为失败
            await db_service.update_product_order(order_id, {"status": "failed"})
            raise HTTPException(status_code=500, detail="扣除Token失败")
        
        logger.info(f"Token扣除成功，更新订单 {order_id} 状态为已支付")
        
        # 更新订单状态为已支付（因为已扣除Token）
        await db_service.update_product_order(order_id, {
            "status": "paid",
            "paid_at": datetime.now().isoformat()
        })
        
        # 获取更新后的订单信息
        updated_order = await db_service.get_product_order(order_id)
        logger.info(f"订单 {order_id} 创建完成，状态: {updated_order.get('status')}")
        
        return ProductOrderResponse(**updated_order)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建实物产品订单失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"创建订单失败: {str(e)}")

@router.get("/product/{order_id}", response_model=ProductOrderResponse)
async def get_product_order(
    order_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """获取实物产品订单详情"""
    try:
        order = await db_service.get_product_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")
            
        # 验证订单所属
        if order["user_id"] != current_user_id:
            raise HTTPException(status_code=403, detail="无权访问此订单")
            
        return ProductOrderResponse(**order)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取实物产品订单失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取订单失败: {str(e)}")

@router.get("/product/user/history")
async def get_product_order_history(
    current_user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 20
):
    """获取用户实物产品订单历史"""
    try:
        orders = await db_service.get_user_product_orders(
            user_id=current_user_id,
            skip=skip,
            limit=limit
        )
        return {
            "total": len(orders),
            "orders": orders
        }
    except Exception as e:
        logger.error(f"获取实物产品订单历史失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取订单历史失败: {str(e)}")