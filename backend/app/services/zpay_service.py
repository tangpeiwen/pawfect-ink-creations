import hashlib
import time
import requests
from typing import Dict
from app.core.config import settings

class ZpayService:
    def __init__(self):
        self.api_url = settings.ZPAY_API_URL
        self.pid = settings.ZPAY_PID
        self.pkey = settings.ZPAY_PKEY
        
        # 验证必需的配置
        if not self.pid or not self.pkey:
            raise ValueError("Zpay配置缺失：请设置ZPAY_PID和ZPAY_PKEY环境变量")
        
    def _generate_sign(self, params: Dict) -> str:
        """生成签名"""
        # 1. 参数按照键名ASCII码从小到大排序
        sorted_params = dict(sorted(params.items()))
        
        # 2. 拼接待签名字符串，排除sign、sign_type和空值
        sign_str = "&".join([f"{k}={v}" for k, v in sorted_params.items() 
                           if v and k not in ["sign", "sign_type"]])
        sign_str += self.pkey  # 拼接商户密钥
        
        # 3. MD5加密并转小写（根据官方文档）
        return hashlib.md5(sign_str.encode()).hexdigest().lower()
    
    def get_payment_form(self, order_id: str, amount: float, notify_url: str, return_url: str) -> Dict:
        """
        获取支付表单数据（页面跳转支付方式）
        
        Args:
            order_id: 商户订单号
            amount: 支付金额（元）
            notify_url: 异步通知地址
            return_url: 同步跳转地址
        """
        params = {
            "pid": self.pid,
            "type": "alipay",
            "out_trade_no": order_id,
            "notify_url": notify_url,
            "return_url": return_url,
            "name": f"Token充值 - {order_id}",
            "money": str(amount),
            "sign_type": "MD5"
        }
        
        # 生成签名
        params["sign"] = self._generate_sign(params)
        
        return {
            "action_url": f"{self.api_url}/submit.php",
            "method": "POST",
            "params": params
        }
    
    async def create_api_order(
        self,
        order_id: str,
        amount: float,
        notify_url: str,
        return_url: str,
        client_ip: str,
        device: str = "pc"
    ) -> Dict:
        """
        创建API支付订单
        
        Args:
            order_id: 商户订单号
            amount: 支付金额（元）
            notify_url: 异步通知地址
            return_url: 同步跳转地址
            client_ip: 客户端IP
            device: 设备类型（pc/mobile）
        """
        params = {
            "pid": self.pid,
            "type": "alipay",
            "out_trade_no": order_id,
            "notify_url": notify_url,
            "return_url": return_url,
            "name": f"Token充值 - {order_id}",
            "money": str(amount),
            "clientip": client_ip,
            "device": device,
            "sign_type": "MD5"
        }
        
        # 生成签名
        params["sign"] = self._generate_sign(params)
        
        try:
            # 发起API支付请求
            response = requests.post(f"{self.api_url}/mapi.php", data=params)
            response.raise_for_status()
            
            # 解析响应
            result = response.json()
            if result.get("code") == 1:
                return {
                    "success": True,
                    "pay_url": result.get("payurl"),
                    "qrcode": result.get("qrcode"),
                    "img": result.get("img"),
                    "trade_no": result.get("trade_no")
                }
            else:
                return {
                    "success": False,
                    "message": result.get("msg", "支付下单失败")
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"支付请求失败: {str(e)}"
            }
    
    def verify_notify(self, notify_params: Dict) -> bool:
        """验证支付回调通知"""
        print(f"[DEBUG] ZpayService - 开始验证回调签名")
        print(f"[DEBUG] ZpayService - 回调参数: {notify_params}")
        
        # 1. 验证签名
        received_sign = notify_params.get("sign", "").lower()
        if not received_sign:
            print(f"[DEBUG] ZpayService - 回调中没有签名参数")
            return False
            
        print(f"[DEBUG] ZpayService - 接收到的签名: {received_sign}")
        
        # 2. 生成签名
        params_without_sign = {k: v for k, v in notify_params.items() 
                             if k not in ["sign", "sign_type"]}
        print(f"[DEBUG] ZpayService - 用于签名的参数: {params_without_sign}")
        
        calculated_sign = self._generate_sign(params_without_sign)
        print(f"[DEBUG] ZpayService - 计算出的签名: {calculated_sign}")
        
        # 3. 比对签名
        is_valid = received_sign == calculated_sign
        print(f"[DEBUG] ZpayService - 签名验证结果: {is_valid}")
        
        return is_valid 