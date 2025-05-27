import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import Layout from "@/components/Layout";
import { PawPrint } from "lucide-react";

const SignInPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center py-12 md:py-16">
        {/* 页面标题和说明 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pet-pink">
            <PawPrint className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">欢迎回来</h1>
          <p className="mt-2 text-gray-600">登录您的萌宠纹身账号</p>
        </div>
        
        {/* Clerk登录组件 */}
        <div className="w-full max-w-md">
          <SignIn 
            routing="path" 
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/"
            afterSignInUrl="/"
          />
        </div>
      </div>
    </Layout>
  );
};

export default SignInPage; 