import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import Layout from '@/components/Layout';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = '/sign-in' }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 正在加载认证状态
  if (loading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center py-20">
          <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-pet-pink animate-spin mb-4" />
              <p className="text-gray-600">正在验证登录状态...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // 用户未认证，重定向到登录页面
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // 用户已认证，显示受保护的内容
  return <>{children}</>;
};

export default ProtectedRoute;

// 导出一个更友好的未认证提示组件
export const AuthRequiredMessage = ({ 
  title = "需要登录", 
  message = "请先登录以访问此功能" 
}: { 
  title?: string; 
  message?: string; 
}) => {
  return (
    <Layout>
      <div className="container flex items-center justify-center py-20">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <a
                href="/sign-in"
                className="block w-full bg-pet-pink text-white py-3 px-4 rounded-lg hover:bg-pet-pink/90 transition-colors"
              >
                立即登录
              </a>
              <a
                href="/register"
                className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                创建新账号
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}; 