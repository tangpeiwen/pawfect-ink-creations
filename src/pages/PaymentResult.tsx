import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE } from "@/lib/api";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"success" | "failed" | "pending">("pending");
  const [message, setMessage] = useState("正在查询支付结果...");
  const { session } = useAuth();

  useEffect(() => {
    const orderId = searchParams.get("out_trade_no");
    if (!orderId) {
      setStatus("failed");
      setMessage("订单号不存在");
      return;
    }

    // 查询订单状态
    const checkOrderStatus = async () => {
      try {
        // 本地开发环境使用相对路径，生产环境使用完整URL
        const apiUrl = import.meta.env.PROD 
          ? `${API_BASE}/orders/${orderId}`
          : `/api/orders/${orderId}`;
          
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          }
        });
        
        if (!response.ok) {
          throw new Error("查询订单失败");
        }

        const data = await response.json();
        if (data.status === "paid") {
          setStatus("success");
          setMessage("支付成功！");
        } else if (data.status === "failed") {
          setStatus("failed");
          setMessage(data.error_message || "支付失败");
        } else {
          // 继续轮询
          setTimeout(checkOrderStatus, 2000);
        }
      } catch (error) {
        setStatus("failed");
        setMessage("查询订单失败，请稍后重试");
      }
    };

    // 确保有认证token后再查询
    if (session?.access_token) {
      checkOrderStatus();
    }
  }, [searchParams, session]);

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          {status === "success" ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : status === "failed" ? (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          ) : (
            <div className="w-16 h-16 border-4 border-pet-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          )}

          <h1 className="text-2xl font-bold mb-4">
            {status === "success"
              ? "支付成功"
              : status === "failed"
              ? "支付失败"
              : "处理中"}
          </h1>

          <p className="text-gray-600 mb-8">{message}</p>

          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => window.location.href = "/pricing"}
            >
              返回价格页面
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = "/"}
            >
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult; 