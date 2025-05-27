import { useNavigate } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";
import Layout from "@/components/Layout";
import { PawPrint } from "lucide-react";

const SignUpPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center py-12 md:py-16">
        {/* 页面标题和说明 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pet-pink">
            <PawPrint className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">创建新账号</h1>
          <p className="mt-2 text-gray-600">注册一个新账号以访问萌宠纹身服务</p>
        </div>
        
        {/* Clerk注册组件 */}
        <div className="w-full max-w-md">
          <SignUp 
            routing="path" 
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/"
            afterSignUpUrl="/"
          />
        </div>
      </div>
    </Layout>
  );
};

export default SignUpPage; 