import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface OrderSuccessData {
  orderId: string;
  orderData: {
    selectedImage: string;
    productType: 'sticker' | 'tattoo';
    productInfo: {
      id: string;
      name: string;
      description: string;
      price: string;
      tokenCost: number;
      features: string[];
      icon: string;
    };
  };
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
    notes: string;
  };
}

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);

  useEffect(() => {
    if (location.state?.orderId && location.state?.orderData && location.state?.shippingInfo) {
      setOrderData({
        orderId: location.state.orderId,
        orderData: location.state.orderData,
        shippingInfo: location.state.shippingInfo
      });
    } else {
      toast.error("订单信息不存在");
      navigate('/create');
    }
  }, [location.state, navigate]);

  const handleViewMyWorks = () => {
    navigate('/my-works');
  };

  const handleCreateNew = () => {
    navigate('/create');
  };

  if (!orderData) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pet-pink mx-auto mb-4"></div>
              <p className="text-gray-600">正在加载订单信息...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* 成功提示 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-green-600">
              订单提交成功！
            </h1>
            <p className="text-gray-600 mb-4">
              感谢您的订购！我们将尽快为您制作并邮寄您的专属宠物贴纸
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-blue-700">
                📦 订单号: <span className="font-mono font-semibold">{orderData.orderId}</span>
              </p>
            </div>
          </div>

          {/* 订单详情卡片 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pet-pink">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                订单详情
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 产品信息 */}
              <div>
                <h3 className="font-medium mb-3">产品信息</h3>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <img 
                      src={orderData.orderData.productInfo.icon} 
                      alt={orderData.orderData.productInfo.name} 
                      className="w-16 h-16 object-contain border rounded-lg"
                      onError={(e) => {
                        // 如果图片加载失败，显示默认图标
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackDiv = target.nextElementSibling as HTMLElement;
                        if (fallbackDiv) {
                          fallbackDiv.style.display = 'flex';
                        }
                      }}
                    />
                    {/* 备用图标 */}
                    <div 
                      className="w-16 h-16 bg-gray-100 border rounded-lg flex items-center justify-center" 
                      style={{ display: 'none' }}
                    >
                      {orderData.orderData.productType === 'sticker' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                          <path d="M8 12h8"/>
                          <path d="M12 8v8"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{orderData.orderData.productInfo.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{orderData.orderData.productInfo.description}</p>
                    <div className="text-lg font-bold text-pet-pink">{orderData.orderData.productInfo.price}</div>
                  </div>
                  <div className="w-24 h-24">
                    <img 
                      src={orderData.orderData.selectedImage} 
                      alt="设计预览" 
                      className="w-full h-full object-contain rounded border"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 收货信息 */}
              <div>
                <h3 className="font-medium mb-3">收货信息</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">收货人</span>
                      <p className="font-medium">{orderData.shippingInfo.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">联系电话</span>
                      <p className="font-medium">{orderData.shippingInfo.phone}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">收货地址</span>
                    <p className="font-medium">
                      {orderData.shippingInfo.province} {orderData.shippingInfo.city} {orderData.shippingInfo.address}
                    </p>
                    <p className="text-sm text-gray-500">邮编: {orderData.shippingInfo.zipCode}</p>
                  </div>
                  {orderData.shippingInfo.notes && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">备注</span>
                      <p className="font-medium">{orderData.shippingInfo.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 处理时间 */}
              <div>
                <h3 className="font-medium mb-3">处理时间</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">订单已提交</p>
                      <p className="text-sm text-gray-500">刚刚</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">制作中</p>
                      <p className="text-sm text-gray-500">预计1-2个工作日</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6-6v6"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">邮寄配送</p>
                      <p className="text-sm text-gray-500">预计3-5个工作日</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 温馨提示 */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">温馨提示</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 我们将在1-2个工作日内完成制作</li>
                    <li>• 制作完成后将通过短信通知您</li>
                    <li>• 邮寄过程中如有问题，请及时联系客服</li>
                    <li>• 您可以在"我的作品"中查看订单状态</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              onClick={handleViewMyWorks}
              className="border-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              查看我的作品
            </Button>
            
            <Button 
              className="pet-button"
              onClick={handleCreateNew}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              创建新作品
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage; 