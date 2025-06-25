import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Calendar, Coins, Package, Clock, CheckCircle, XCircle, Truck, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserTokenBalance, getProductOrderHistory } from "@/lib/api";
import { toast } from "sonner";

interface TokenBalance {
  success: boolean;
  tokens_remaining: number;
  message: string;
}

interface ProductOrder {
  id: string;
  product_type: string;
  product_name: string;
  token_cost: number;
  design_image_url: string;
  recipient_name: string;
  recipient_phone: string;
  shipping_province: string;
  shipping_city: string;
  shipping_address: string;
  status: string;
  created_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  tracking_number?: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const navigate = useNavigate();
  
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      paid: '已支付',
      processing: '制作中',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  const loadUserData = useCallback(async (showRefreshingState = false) => {
    try {
      console.log('=== 开始加载用户数据 ===', { showRefreshingState });
      
      if (showRefreshingState) {
        setIsRefreshing(true);
      } else {
        setIsLoadingData(true);
      }
      
      // 并行获取token余额和订单历史
      const [balanceResult, ordersResult] = await Promise.allSettled([
        getUserTokenBalance(),
        getProductOrderHistory(0, 10)
      ]);

      console.log('API调用结果:', { balanceResult, ordersResult });

      if (balanceResult.status === 'fulfilled') {
        console.log('Token余额获取成功:', balanceResult.value);
        setTokenBalance(balanceResult.value);
      } else {
        console.error('获取token余额失败:', balanceResult.reason);
        if (!showRefreshingState) {
          toast.error('获取Token余额失败');
        }
      }

      if (ordersResult.status === 'fulfilled') {
        const newOrders = ordersResult.value.orders || [];
        console.log('订单历史获取成功:', newOrders);
        
        // 检查是否有订单状态变化（仅在手动刷新时检查）
        if (orders.length > 0 && showRefreshingState) {
          const statusChanges = newOrders.filter(newOrder => {
            const oldOrder = orders.find(o => o.id === newOrder.id);
            return oldOrder && oldOrder.status !== newOrder.status;
          });
          
          if (statusChanges.length > 0) {
            statusChanges.forEach(order => {
              toast.success(`订单 ${order.id} 状态已更新为：${getStatusLabel(order.status)}`);
            });
          }
        }
        
        setOrders(newOrders);
        setLastRefreshTime(new Date());
      } else {
        console.error('获取订单历史失败:', ordersResult.reason);
        if (!showRefreshingState) {
          toast.error('获取订单历史失败');
        }
      }

    } catch (error) {
      console.error('加载用户数据失败:', error);
      if (!showRefreshingState) {
        toast.error('加载用户数据失败');
      }
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
      console.log('=== 用户数据加载完成 ===');
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      console.log('=== 检查用户登录状态 ===');
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        console.log('用户已登录:', data.session.user);
        setUser(data.session.user);
        // 获取用户的token余额和订单历史
        await loadUserData();
      } else {
        console.log('用户未登录，跳转到登录页');
        navigate("/sign-in");
      }
      setIsLoaded(true);
    };

    checkUser();
  }, [navigate, loadUserData]);

  // TODO: 将来可以在这里添加WebSocket或Server-Sent Events来接收实时订单状态更新
  // useEffect(() => {
  //   if (!user) return;
  //   
  //   // 监听订单状态变化的实时通知
  //   const handleOrderStatusUpdate = (orderUpdate) => {
  //     setOrders(prevOrders => 
  //       prevOrders.map(order => 
  //         order.id === orderUpdate.id 
  //           ? { ...order, ...orderUpdate }
  //           : order
  //       )
  //     );
  //     toast.success(`订单 ${orderUpdate.id} 状态已更新为：${getStatusLabel(orderUpdate.status)}`);
  //   };
  //   
  //   // 建立WebSocket连接或订阅Server-Sent Events
  //   // const unsubscribe = subscribeToOrderUpdates(user.id, handleOrderStatusUpdate);
  //   
  //   // return () => unsubscribe();
  // }, [user]);

  const handleManualRefresh = () => {
    console.log('=== 手动刷新 ===');
    loadUserData(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: '待处理', variant: 'outline' },
      paid: { label: '已支付', variant: 'default' },
      processing: { label: '制作中', variant: 'secondary' },
      shipped: { label: '已发货', variant: 'default' },
      delivered: { label: '已送达', variant: 'default' },
      cancelled: { label: '已取消', variant: 'destructive' }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'paid':
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // 显示加载状态
  if (!isLoaded) {
    return (
      <Layout>
        <div className="container flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pet-pink"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-8">个人资料</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 个人信息卡片 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                基本信息
              </CardTitle>
              <CardDescription>
                您的账户基本信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">邮箱:</span>
                <span className="font-medium">{user?.email || "未设置"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">注册时间:</span>
                <span className="font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : "未知"}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Token余额卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-pet-pink" />
                Token余额
              </CardTitle>
              <CardDescription>
                您的Token使用情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pet-pink"></div>
                </div>
              ) : tokenBalance ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-pet-pink mb-2">
                    {tokenBalance.tokens_remaining}
                  </div>
                  <div className="text-sm text-gray-600">剩余Token</div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm">获取失败</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 订单历史 */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  订单历史
                </CardTitle>
                <CardDescription>
                  您的实物产品订单记录
                  {lastRefreshTime && (
                    <span className="text-xs text-gray-400 block mt-1">
                      最后更新: {lastRefreshTime.toLocaleTimeString('zh-CN')}
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? '刷新中...' : '刷新'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pet-pink"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{order.product_name}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>订单号: {order.id}</div>
                            <div>消耗Token: {order.token_cost}</div>
                            <div>收货人: {order.recipient_name}</div>
                            <div>下单时间: {new Date(order.created_at).toLocaleString('zh-CN')}</div>
                            {order.tracking_number && (
                              <div>快递单号: {order.tracking_number}</div>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            收货地址: {order.shipping_province} {order.shipping_city} {order.shipping_address}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <img 
                          src={order.design_image_url} 
                          alt="设计预览" 
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无订单记录</p>
                <p className="text-sm mt-1">快去制作您的第一个专属贴纸吧！</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage; 