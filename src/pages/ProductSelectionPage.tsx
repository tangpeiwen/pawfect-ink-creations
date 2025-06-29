import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { getUserTokenBalance } from '@/lib/api';

interface ProductOption {
  id: 'sticker' | 'tattoo';
  name: string;
  description: string;
  price: string;
  tokenCost: number;
  features: string[];
  icon: string;
  popular?: boolean;
}

const ProductSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<'sticker' | 'tattoo' | null>(null);
  const [userTokens, setUserTokens] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // 从路由状态获取选中的图片
  useEffect(() => {
    if (location.state?.selectedImage) {
      setSelectedImage(location.state.selectedImage);
    } else {
      // 如果没有选中的图片，返回创建页面
      toast.error("请先选择一张图片");
      navigate('/create');
      return;
    }

    // 获取用户token余额
    fetchUserTokens();
  }, [location.state, navigate]);

  const fetchUserTokens = async () => {
    try {
      setLoading(true);
      const tokenData = await getUserTokenBalance();
      setUserTokens(tokenData.tokens_remaining || 0);
    } catch (error) {
      console.error('获取token余额失败:', error);
      toast.error('获取余额失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const productOptions: ProductOption[] = [
    {
      id: 'sticker',
      name: '卡通贴纸',
      description: '高品质贴纸，适合装饰笔记本、手机等',
      price: '1000 Token',
      tokenCost: 1000,
      features: [
        '高清打印',
        '防水材质',
        '包邮'
      ],
      icon: '/images/sticker.png'
    },
    {
      id: 'tattoo',
      name: '纹身贴',
      description: '专业纹身贴纸，安全无毒',
      price: '1200 Token',
      tokenCost: 1200,
      features: [
        '医用级材料',
        '安全无毒',
        '包邮'
      ],
      icon: '/images/tattoo.png',
      popular: true
    }
  ];

  const handleProductSelect = (productId: 'sticker' | 'tattoo') => {
    setSelectedProduct(productId);
  };

  const handleContinue = () => {
    if (!selectedProduct) {
      toast.error("请选择产品类型");
      return;
    }

    const selectedOption = productOptions.find(option => option.id === selectedProduct);
    if (!selectedOption) return;

    // 检查token余额
    if (selectedProduct === 'tattoo' && userTokens < selectedOption.tokenCost) {
      toast.error(`制作纹身贴需要 ${selectedOption.tokenCost} Token，您的余额不足`);
      navigate('/pricing');
      return;
    }

    // 跳转到确认页面
    navigate('/order-confirm', {
      state: {
        selectedImage,
        productType: selectedProduct,
        productInfo: selectedOption
      }
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pet-pink mx-auto mb-4"></div>
              <p className="text-gray-600">正在加载...</p>
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
              选择您的<span className="bg-clip-text text-transparent bg-gradient-pet">产品类型</span>
            </h1>
            <p className="text-gray-600">
              请选择您想要制作的产品类型，我们将为您提供最优质的服务
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <p className="text-sm text-blue-700">
                💰 当前余额: <span className="font-semibold">{userTokens} Token</span>
              </p>
            </div>
          </div>

          {/* 选中的图片预览 */}
          {selectedImage && (
            <div className="mb-8 text-center">
              <h3 className="text-lg font-medium mb-4">您选择的设计</h3>
              <div className="inline-block">
                <img 
                  src={selectedImage} 
                  alt="选中的设计" 
                  className="w-48 h-48 object-contain rounded-lg border-2 border-pet-pink/20 shadow-lg"
                />
              </div>
            </div>
          )}

          {/* 产品选择 */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {productOptions.map((option) => (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg relative ${
                  selectedProduct === option.id 
                    ? 'border-2 border-pet-pink shadow-lg' 
                    : 'border border-gray-200 hover:border-pet-pink/50'
                }`}
                onClick={() => handleProductSelect(option.id)}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-pet-pink text-white px-4 py-1 rounded-full text-sm font-medium">
                    推荐
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="mb-2 relative">
                      <img 
                        src={option.icon} 
                        alt={option.name} 
                        className="w-16 h-16 mx-auto object-contain"
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
                        className="w-16 h-16 bg-gray-100 border rounded-lg flex items-center justify-center mx-auto" 
                        style={{ display: 'none' }}
                      >
                        {option.id === 'sticker' ? (
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
                    <h3 className="text-xl font-display font-bold mb-2">{option.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                    <div className="text-2xl font-bold text-pet-pink">{option.price}</div>
                    {option.tokenCost > 0 && userTokens < option.tokenCost && (
                      <p className="text-red-500 text-sm mt-1">余额不足</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">特点:</h4>
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedProduct === option.id && (
                    <div className="mt-4 p-3 bg-pet-pink/10 border border-pet-pink/20 rounded-lg">
                      <div className="flex items-center text-pet-pink">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-sm font-medium">已选择</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/create')}
              className="border-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              返回修改设计
            </Button>
            
            <Button 
              className="pet-button"
              onClick={handleContinue}
              disabled={!selectedProduct}
            >
              继续下单
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductSelectionPage; 