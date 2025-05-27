import { useAuth, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { PawPrint } from "lucide-react";

interface ProtectedPageProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * 保护需要登录才能访问的页面
 * 如果用户未登录，重定向到登录页面
 */
export const ProtectedPage = ({ 
  children, 
  redirectTo = "/sign-in" 
}: ProtectedPageProps) => {
  const { isLoaded } = useAuth();

  // 显示加载状态
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pet-pink"></div>
          <PawPrint className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-pet-pink" />
        </div>
        <p className="mt-4 text-gray-600">正在加载，请稍候...</p>
      </div>
    );
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to={redirectTo} replace />
      </SignedOut>
    </>
  );
}; 