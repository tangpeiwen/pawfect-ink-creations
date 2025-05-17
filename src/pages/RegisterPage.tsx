import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!email || !password || !confirmPassword) {
      toast({
        title: "注册失败",
        description: "请填写所有必填字段",
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: "注册成功",
        description: "请检查您的邮箱并点击验证链接完成注册",
      });
      
      // 注册成功后导航到登录页面
      navigate("/sign-in");
    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container flex items-center justify-center py-12 md:py-16">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
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
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterPage; 