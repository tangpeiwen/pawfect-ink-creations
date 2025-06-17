from sqlalchemy import Column, Integer, String, Boolean
from backend.database import Base

class TokenPackage(Base):
    __tablename__ = "token_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Integer, nullable=False)  # 价格（分）
    token_amount = Column(Integer, nullable=False)  # token数量
    is_popular = Column(Boolean, default=False)  # 是否推荐
    features = Column(String, nullable=True)  # 额外特性，JSON字符串 