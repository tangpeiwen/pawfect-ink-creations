from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.sql import func
from backend.database import Base
import enum

class OrderStatus(str, enum.Enum):
    PENDING = "pending"  # 待支付
    PAID = "paid"       # 已支付
    FAILED = "failed"   # 支付失败
    CANCELLED = "cancelled"  # 已取消
    REFUNDED = "refunded"   # 已退款

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True)  # 订单号，使用自定义生成
    user_id = Column(String, ForeignKey("users.id"), nullable=False)  # UUID类型
    package_id = Column(String, ForeignKey("token_packages.id"), nullable=False)  # 修改为String类型
    
    amount = Column(Integer, nullable=False)  # 支付金额（分）
    token_amount = Column(Integer, nullable=False)  # 购买的token数量
    
    status = Column(String, nullable=False, default=OrderStatus.PENDING)
    payment_method = Column(String, nullable=True)  # 支付方法
    payment_id = Column(String, nullable=True)  # 支付平台订单号
    
    extra = Column(JSON, nullable=True)  # 额外信息，如优惠券等
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)  # 支付时间
    
    error_message = Column(String, nullable=True)  # 错误信息 