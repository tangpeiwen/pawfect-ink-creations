import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Mail, Phone, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'email' | 'phone' | 'otp'>('email');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+86");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyTarget, setVerifyTarget] = useState(""); // 存储需要验证的邮箱或手机号
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // 检查当前会话状态
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  // 邮箱登录处理
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "登录失败",
        description: "请填写邮箱和密码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 手机发送验证码
  const handleSendPhoneOTP = async () => {
    if (!phone || phone.length < 8) {
      toast({
        title: "操作失败",
        description: "请输入有效的手机号码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 确保手机号有正确的国际前缀
      const formattedPhone = phone.startsWith('+') ? phone : `+86${phone.replace(/^86/, '')}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setVerifyTarget(formattedPhone);
      toast({
        title: "验证码已发送",
        description: "请查看您的手机短信",
      });
    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 手机验证码登录
  const handlePhoneLogin = async () => {
    if (!phone || !phoneVerificationCode) {
      toast({
        title: "登录失败",
        description: "请填写手机号和验证码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 确保手机号有正确的国际前缀
      const formattedPhone = phone.startsWith('+') ? phone : `+86${phone.replace(/^86/, '')}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: phoneVerificationCode,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "验证失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 验证OTP码
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast({
        title: "验证失败",
        description: "请输入验证码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 手机OTP验证
      const response = await supabase.auth.verifyOtp({
        phone: verifyTarget,
        token: otpCode,
        type: 'sms',
      });

      if (response.error) throw response.error;

      toast({
        title: "验证成功",
        description: "您已成功登录",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "验证失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth登录
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      // 成功启动OAuth流程后，页面将被重定向，因此不需要额外的成功处理
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // 根据不同的视图渲染不同的内容
  const renderView = () => {
    if (activeView === 'otp') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="验证码"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="border-2 border-gray-200 rounded-lg h-14 w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-14 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
              onClick={() => setActiveView('phone')}
              disabled={isLoading}
            >
              获取验证码
            </Button>
            <Button
              type="button"
              className="h-14 font-medium bg-pet-pink text-white rounded-lg hover:bg-pet-pink/90"
              onClick={handleVerifyOTP}
              disabled={isLoading}
            >
              登录/注册
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Tabs defaultValue={activeView} className="w-full" onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-2 h-12 border-b border-gray-200">
          <TabsTrigger 
            value="email" 
            className="data-[state=active]:text-pet-pink data-[state=active]:border-b-2 data-[state=active]:border-pet-pink rounded-none bg-transparent"
          >
            账号密码登录
          </TabsTrigger>
          <TabsTrigger 
            value="phone" 
            className="data-[state=active]:text-pet-pink data-[state=active]:border-b-2 data-[state=active]:border-pet-pink rounded-none bg-transparent"
          >
            手机号登录
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="space-y-6 mt-4">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="邮箱地址或用户名"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-gray-200 rounded-lg h-14"
              required
            />
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-gray-200 rounded-lg h-14"
              required
            />
          </div>
          <div className="flex items-center">
            <Checkbox
              id="remember-email"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-pet-pink text-pet-pink"
            />
            <label
              htmlFor="remember-email"
              className="ml-2 text-sm text-gray-500"
            >
              记住我
            </label>
          </div>
          <Button
            type="button"
            className="w-full font-medium bg-pet-pink text-white h-14 rounded-lg hover:bg-pet-pink/90"
            onClick={handleEmailLogin}
            disabled={isLoading}
          >
            登录
          </Button>
        </TabsContent>
        
        <TabsContent value="phone" className="space-y-6 mt-4">
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="+86 请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-2 border-gray-200 rounded-lg h-14"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="验证码"
              value={phoneVerificationCode}
              onChange={(e) => setPhoneVerificationCode(e.target.value)}
              className="border-2 border-gray-200 rounded-lg h-14"
              required
            />
            <Button
              type="button"
              variant="outline"
              className="h-14 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
              onClick={handleSendPhoneOTP}
              disabled={isLoading}
            >
              获取验证码
            </Button>
          </div>
          
          <Button
            type="button"
            className="w-full font-medium bg-pet-pink text-white h-14 rounded-lg hover:bg-pet-pink/90"
            onClick={handlePhoneLogin}
            disabled={isLoading}
          >
            登录/注册
          </Button>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Layout>
      <div className="container flex items-center justify-center py-12 md:py-16">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-pet-pink">
              <PawPrint className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
            <CardDescription>
              请登录您的账号以访问萌宠纹身服务
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderView()}
            
            {activeView !== 'otp' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">或者</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-200 h-14 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  使用Google账号登录
                </Button>
              </>
            )}
          </CardContent>
          
          <CardFooter className="text-center">
            <div className="text-sm w-full">
              {activeView !== 'otp' && (
                <>
                  还没有账号？{" "}
                  <Link to="/register" className="font-medium text-pet-pink hover:underline">
                    点击注册
                  </Link>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AuthPage;
