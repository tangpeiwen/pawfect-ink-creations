import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Mail, Lock, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!username || !email || !password || !confirmPassword) {
      toast({
        title: "注册失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    // 用户名验证
    if (username.length < 2) {
      toast({
        title: "用户名太短",
        description: "用户名至少需要2个字符",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保两次输入的密码相同",
        variant: "destructive",
      });
      return;
    }

    // 密码强度检查
    if (password.length < 6) {
      toast({
        title: "密码太弱",
        description: "密码必须至少包含6个字符",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('开始注册用户:', email, '用户名:', username);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirm: true,
            display_name: username  // 将用户名保存到用户元数据中
          }
        },
      });

      console.log('注册响应:', data);
      console.log('注册错误:', error);

      if (error) throw error;

      // 检查用户是否需要邮件确认
      if (data.user && !data.user.email_confirmed_at) {
        console.log('用户需要邮件确认，用户ID:', data.user.id);
      }

      toast({
        title: "注册成功",
        description: "请检查您的邮箱并点击验证链接完成注册",
      });
      
      // 设置成功状态，显示成功页面
      setIsSuccess(true);
      
      // 注意：用户资料创建将在邮箱验证后的登录时进行
      
    } catch (error: any) {
      console.error('注册失败:', error);
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 重发验证邮件
  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;

      toast({
        title: "验证邮件已重发",
        description: "请检查您的邮箱",
      });
    } catch (error: any) {
      toast({
        title: "重发失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Layout>
      <div className="container flex items-center justify-center py-12 md:py-16">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
          {!isSuccess ? (
            // 注册表单
            <>
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-pet-pink">
                  <PawPrint className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">创建新账号</CardTitle>
                <CardDescription>
                  注册一个新账号以访问萌宠纹身服务
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-[17px] h-5 w-5 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border-2 border-gray-200 pl-10 rounded-lg h-14"
                        required
                        minLength={2}
                      />
                    </div>
                    
                    <div className="relative">
                      <Mail className="absolute left-3 top-[17px] h-5 w-5 text-gray-500" />
                      <Input
                        type="email"
                        placeholder="邮箱地址"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-2 border-gray-200 pl-10 rounded-lg h-14"
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-[17px] h-5 w-5 text-gray-500" />
                      <Input
                        type="password"
                        placeholder="设置密码（至少6个字符）"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-2 border-gray-200 pl-10 rounded-lg h-14"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-[17px] h-5 w-5 text-gray-500" />
                      <Input
                        type="password"
                        placeholder="确认密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border-2 border-gray-200 pl-10 rounded-lg h-14"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full font-medium bg-pet-pink text-white h-14 rounded-lg hover:bg-pet-pink/90"
                    disabled={isLoading}
                  >
                    注册账号
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="text-center">
                <div className="text-sm w-full">
                  已经有账号？{" "}
                  <Link to="/sign-in" className="font-medium text-pet-pink hover:underline">
                    登录
                  </Link>
                </div>
              </CardFooter>
            </>
          ) : (
            // 注册成功页面
            <>
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">注册成功！</CardTitle>
                <CardDescription>
                  我们已经向您的邮箱发送了验证链接
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">接下来的步骤：</h3>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. 检查您的邮箱：<strong>{email}</strong></li>
                    <li>2. 点击验证链接完成注册</li>
                    <li>3. 返回登录页面使用您的账号</li>
                  </ol>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={() => navigate("/sign-in")}
                    className="bg-pet-pink text-white hover:bg-pet-pink/90"
                  >
                    前往登录页面
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="mr-2"
                  >
                    {isResending ? "发送中..." : "重发验证邮件"}
                  </Button>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    重新注册
                  </button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterPage; 