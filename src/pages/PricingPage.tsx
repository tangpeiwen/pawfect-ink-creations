import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Check, Zap, Star, Coins, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const PricingPage = () => {
  const { session, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending');
  const [paymentData, setPaymentData] = useState<{
    qr_code?: string;
    qr_img?: string;
    pay_url?: string;
    payment_form?: {
      action_url: string;
      method: string;
      params: Record<string, string>;
    };
  } | null>(null);

  const tokenPackages = [
    {
      id: "package_30",
      name: "基础Token包",
      price: "30",
      tokens: "1,500",
      description: "适合偶尔使用的用户",
      features: [
        "1,500 Tokens",
        "可生成约7张图片",
        "包含所有风格选择",
        "高清图片下载",
        "永久有效期"
      ],
      buttonText: "立即购买",
      buttonVariant: "outline" as const,
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: "package_50", 
      name: "标准Token包",
      price: "50",
      tokens: "5,000",
      description: "性价比最高的选择",
      features: [
        "5,000 Tokens",
        "可生成约25张图片",
        "包含所有风格选择",
        "高清图片下载",
        "永久有效期",
        "优先处理"
      ],
      buttonText: "立即购买",
      buttonVariant: "primary" as const,
      recommended: true,
      icon: <Star className="w-5 h-5" />
    },
    {
      id: "package_100",
      name: "超值Token包",
      price: "100", 
      tokens: "12,000",
      description: "重度用户的最佳选择",
      features: [
        "12,000 Tokens",
        "可生成约60张图片",
        "包含所有风格选择",
        "高清图片下载",
        "永久有效期",
        "优先处理",
        "专属客服支持"
      ],
      buttonText: "立即购买",
      buttonVariant: "outline" as const,
      icon: <Coins className="w-5 h-5 text-yellow-500" />
    }
  ];

  const faqs = [
    {
      question: "Token如何使用？",
      answer: "每次生成图片消耗200 Token，如需制作纹身贴则额外消耗1000 Token。新用户注册即获得500 Token体验。"
    },
    {
      question: "Token会过期吗？",
      answer: "Token永久有效，购买后可随时使用，无时间限制。"
    },
    {
      question: "可以退款吗？",
      answer: "未使用的Token支持7天内无理由退款。"
    },
    {
      question: "如何查看余额？",
      answer: "登录后在个人中心可查看当前Token余额和使用记录。"
    },
    {
      question: "纹身贴的材质是什么？",
      answer: "我们的纹身贴使用高品质、防水、可持续30天的医用级安全材料，无毒无刺激，对皮肤友好。"
    },
    {
      question: "如何使用纹身贴？",
      answer: "将纹身贴贴在清洁的皮肤上，用湿毛巾按压30秒，轻轻揭开背纸即可。如需去除，可用肥皂水或酒精轻轻擦拭。"
    }
  ];

  // 轮询检查支付状态
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (currentOrderId && showQRCode && paymentStatus === 'pending') {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/orders/${currentOrderId}`, {
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
            }
          });
          
          if (response.ok) {
            const orderData = await response.json();
            
            if (orderData.status === 'paid') {
              setPaymentStatus('success');
              setShowQRCode(false);
              setShowSuccessModal(true);
              
              // 自动跳转逻辑：显示成功提醒1.5秒后跳转
              setTimeout(() => {
                setShowSuccessModal(false);
                navigate('/');
              }, 1500);
              
            } else if (orderData.status === 'failed') {
              setPaymentStatus('failed');
              alert('支付失败，请重试');
            }
          }
        } catch (error) {
          console.error('检查支付状态失败:', error);
        }
      }, 3000); // 每3秒检查一次
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentOrderId, showQRCode, paymentStatus, session, navigate]);

  const handlePurchase = async (packageId: string) => {
    try {
      // 检查用户是否已登录
      if (!isAuthenticated || !session) {
        alert('请先登录后再购买');
        return;
      }

      // 创建订单
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ package_id: packageId })
      });

      if (!response.ok) {
        throw new Error('创建订单失败');
      }

      const data = await response.json();
      
      // 设置当前订单ID用于状态轮询
      setCurrentOrderId(data.id);
      setPaymentStatus('pending');
      
      // 处理移动端支付表单
      if (data.payment_form) {
        // 创建表单并提交
        const form = document.createElement('form');
        form.method = data.payment_form.method;
        form.action = data.payment_form.action_url;
        
        // 添加表单字段
        Object.entries(data.payment_form.params).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });
        
        // 提交表单
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }
      // 处理PC端支付
      else if (data.pay_url) {
        setPaymentData(data);
        setShowQRCode(true);
      } else {
        alert('获取支付信息失败，请重试');
      }
    } catch (error) {
      console.error('购买失败:', error);
      alert('购买失败，请重试');
    }
  };

  // 关闭支付弹窗时清理状态
  const handleCloseQRCode = () => {
    setShowQRCode(false);
    setShowSuccessModal(false);
    setCurrentOrderId(null);
    setPaymentStatus('pending');
    setPaymentData(null);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-pet">Token充值包</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            每次生成消耗200 Token，纹身贴额外消耗1000 Token。选择适合的Token包，享受AI生成服务。
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg inline-block">
            <p className="text-sm text-blue-800">
              <strong>价格说明：</strong>每张图片生成200 Token，制作纹身贴需额外1000 Token
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tokenPackages.map((pkg, index) => (
            <div 
              key={index} 
              className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                pkg.recommended
                  ? 'border-pet-pink shadow-xl relative z-10 scale-105 my-4 md:my-0 bg-white' 
                  : 'border-gray-200 bg-white hover:border-pet-pink/50'
              }`}
            >
              {pkg.recommended && (
                <div className="bg-pet-pink text-white text-center py-2 font-medium">
                  <Star className="w-4 h-4 inline mr-1" />
                  最受欢迎
                </div>
              )}
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  {pkg.icon}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">¥{pkg.price}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-pet-pink">{pkg.tokens}</span>
                    <span className="text-gray-600 ml-2">Tokens</span>
                  </div>
                  <p className="text-gray-600 mt-2">{pkg.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-pet-pink mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full py-3 ${
                    pkg.buttonVariant === 'primary' 
                      ? 'pet-button' 
                      : 'border-2 border-pet-pink text-pet-pink hover:bg-pet-pink hover:text-white'
                  }`}
                  onClick={() => handlePurchase(pkg.id)}
                >
                  立即购买
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8">常见问题</h2>
          <div className="max-w-3xl mx-auto">
            <div className="divide-y">
              {faqs.map((faq, index) => (
                <div key={index} className="py-6">
                  <h3 className="text-lg font-display font-bold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">还有其他问题？</h2>
          <p className="text-gray-600 mb-6">我们的客服团队随时为您提供帮助</p>
          <Button className="pet-button px-8 py-6 text-lg">
            联系我们
          </Button>
        </div>
      </div>

      {/* 添加支付二维码弹窗 */}
      <Dialog open={showQRCode} onOpenChange={handleCloseQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">请扫码支付</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            {paymentData?.qr_img ? (
              <img 
                src={paymentData.qr_img} 
                alt="支付二维码" 
                className="w-64 h-64 border border-gray-200 rounded-lg"
                onError={(e) => {
                  console.error('二维码图片加载失败:', paymentData.qr_img);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : paymentData?.qr_code ? (
              <div className="w-64 h-64 flex items-center justify-center border border-gray-200 rounded-lg bg-white">
                <QRCodeSVG value={paymentData.qr_code} size={240} />
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">二维码加载中...</p>
              </div>
            )}
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                请使用支付宝扫描二维码完成支付
              </p>
              <p className="text-xs text-gray-400">
                {paymentStatus === 'pending' ? '支付完成后页面将自动更新' : '正在检查支付状态...'}
              </p>
              {paymentStatus === 'pending' && (
                <div className="flex items-center justify-center mt-2">
                  <div className="w-4 h-4 border-2 border-pet-pink border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm text-gray-500">等待支付中...</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 支付成功弹窗 */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">支付成功！</h2>
              <p className="text-gray-600">
                Token已成功充值到您的账户
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-pet-pink border-t-transparent rounded-full animate-spin"></div>
              <span>1.5秒后自动跳转到首页...</span>
            </div>
            
            <div className="flex space-x-3 w-full">
              <Button 
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200" 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/profile');
                }}
              >
                查看余额
              </Button>
              <Button 
                className="flex-1 pet-button" 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
              >
                开始创作
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PricingPage; 