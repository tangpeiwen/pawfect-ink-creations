import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { createProductOrder } from '@/lib/api';

interface OrderData {
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
}

interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  notes: string;
}

const OrderConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (location.state?.selectedImage && location.state?.productType && location.state?.productInfo) {
      setOrderData({
        selectedImage: location.state.selectedImage,
        productType: location.state.productType,
        productInfo: location.state.productInfo
      });
    } else {
      toast.error("订单信息不完整，请重新选择");
      navigate('/create');
    }
  }, [location.state, navigate]);

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!shippingInfo.name.trim()) {
      newErrors.name = '请输入收货人姓名';
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(shippingInfo.phone)) {
      newErrors.phone = '请输入正确的手机号码';
    }

    if (!shippingInfo.province.trim()) {
      newErrors.province = '请输入省份';
    }

    if (!shippingInfo.city.trim()) {
      newErrors.city = '请输入城市';
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = '请输入详细地址';
    }

    if (!shippingInfo.zipCode.trim()) {
      newErrors.zipCode = '请输入邮政编码';
    } else if (!/^\d{6}$/.test(shippingInfo.zipCode)) {
      newErrors.zipCode = '请输入正确的邮政编码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!orderData) return;

    if (!validateForm()) {
      toast.error("请完善收货信息");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderResult = await createProductOrder({
        productType: orderData.productType,
        productName: orderData.productInfo.name,
        tokenCost: orderData.productInfo.tokenCost,
        designImageUrl: orderData.selectedImage,
        shippingInfo: {
          name: shippingInfo.name,
          phone: shippingInfo.phone,
          province: shippingInfo.province,
          city: shippingInfo.city,
          address: shippingInfo.address,
          zipCode: shippingInfo.zipCode,
          notes: shippingInfo.notes
        }
      });

      toast.success("订单提交成功！");
      
      // 跳转到订单成功页面或支付页面
      navigate('/order-success', {
        state: {
          orderId: orderResult.id,
          orderData,
          shippingInfo
        }
      });

    } catch (error) {
      console.error('提交订单失败:', error);
      toast.error(error instanceof Error ? error.message : '订单提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              确认<span className="bg-clip-text text-transparent bg-gradient-pet">订单信息</span>
            </h1>
            <p className="text-gray-600">
              请填写收货信息，我们将为您制作并邮寄您的专属宠物贴纸
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* 左侧：收货信息表单 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pet-pink">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  收货信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">收货人姓名 *</Label>
                    <Input
                      id="name"
                      value={shippingInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="请输入收货人姓名"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">联系电话 *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="请输入手机号码"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="province">省份 *</Label>
                    <Input
                      id="province"
                      value={shippingInfo.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      placeholder="省份"
                      className={errors.province ? 'border-red-500' : ''}
                    />
                    {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                  </div>
                  <div>
                    <Label htmlFor="city">城市 *</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="城市"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">邮政编码 *</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="邮政编码"
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">详细地址 *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="请输入详细地址（街道、门牌号等）"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <Label htmlFor="notes">备注信息</Label>
                  <Textarea
                    id="notes"
                    value={shippingInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="如有特殊要求，请在此填写"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 右侧：订单详情 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pet-pink">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                  订单详情
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 产品信息 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={orderData.productInfo.icon} 
                      alt={orderData.productInfo.name} 
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
                      {orderData.productType === 'sticker' ? (
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
                    <h3 className="font-semibold text-lg">{orderData.productInfo.name}</h3>
                    <p className="text-gray-600 text-sm">{orderData.productInfo.description}</p>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-pet-pink">{orderData.productInfo.price}</span>
                      {orderData.productInfo.tokenCost > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({orderData.productInfo.tokenCost} Token)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 设计预览 */}
                <div>
                  <h4 className="font-medium mb-2">您的设计</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <img 
                      src={orderData.selectedImage} 
                      alt="设计预览" 
                      className="w-32 h-32 object-contain mx-auto rounded-lg border"
                    />
                  </div>
                </div>

                <Separator />

                {/* 产品特性 */}
                <div>
                  <h4 className="font-medium mb-2">产品特性</h4>
                  <ul className="space-y-1">
                    {orderData.productInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* 费用明细 */}
                <div>
                  <h4 className="font-medium mb-2">费用明细</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>产品费用</span>
                      <span>{orderData.productInfo.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>邮寄费用</span>
                      <span>免费</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>总计</span>
                      <span className="text-pet-pink">{orderData.productInfo.price}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/product-selection', { state: { selectedImage: orderData.selectedImage } })}
              className="border-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              返回修改
            </Button>
            
            <Button 
              className="pet-button"
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  提交中...
                </>
              ) : (
                <>
                  确认下单
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmPage; 