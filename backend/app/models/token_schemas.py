from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

# ==================== Token系统模型 ====================

# Token充值包模型
class TokenPackage(BaseModel):
    id: str
    name: str
    price_rmb: int
    tokens: int
    is_active: bool = True
    sort_order: int = 0
    created_at: datetime

class TokenPackageCreate(BaseModel):
    id: str
    name: str
    price_rmb: int
    tokens: int
    is_active: bool = True
    sort_order: int = 0

# Token交易记录模型
class TokenTransaction(BaseModel):
    id: str
    user_id: str
    transaction_type: Literal['purchase', 'consume', 'refund']
    amount: int
    balance_after: int
    description: Optional[str] = None
    generation_id: Optional[str] = None
    package_id: Optional[str] = None
    created_at: datetime

class TokenTransactionCreate(BaseModel):
    user_id: str
    transaction_type: Literal['purchase', 'consume', 'refund']
    amount: int
    balance_after: int
    description: Optional[str] = None
    generation_id: Optional[str] = None
    package_id: Optional[str] = None

# Token相关响应模型
class TokenBalanceResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    tokens_remaining: int

class TokenPackagesResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    packages: List[TokenPackage]

class TokenConsumptionRequest(BaseModel):
    tokens_to_consume: int
    description: Optional[str] = None
    generation_id: Optional[str] = None

class TokenPurchaseRequest(BaseModel):
    package_id: str
    payment_method: Optional[str] = None