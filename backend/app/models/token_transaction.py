from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.database import Base

class TokenTransaction(Base):
    __tablename__ = "token_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # 正数表示增加，负数表示减少
    description = Column(String, nullable=False)
    generation_id = Column(String, nullable=True)  # 关联的生成任务ID
    package_id = Column(Integer, ForeignKey("token_packages.id"), nullable=True)  # 关联的token套餐ID
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 