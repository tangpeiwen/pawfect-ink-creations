import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Mail, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/hooks/useAuth';
import { API_BASE } from '@/lib/api';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // 登录成功后同步用户资料到后端
      if (data.user) {
        try {
          const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`
            },
            body: JSON.stringify({
              user_id: data.user.id,
              email: data.user.email,
              display_name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0]
            })
          });

          if (!response.ok) {
            console.warn('用户资料同步失败，但登录成功');
          } else {
            console.log('用户资料同步成功');
          }
        } catch (syncError) {
          console.warn('用户资料同步出错，但登录成功:', syncError);
        }
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
              请登录您的账号以访问萌宠贴纸制作服务
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleEmailLogin} className="space-y-6">
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
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-gray-200 pl-10 rounded-lg h-14"
                    required
                  />
                </div>
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
                type="submit"
                className="w-full font-medium bg-pet-pink text-white h-14 rounded-lg hover:bg-pet-pink/90"
                disabled={isLoading}
              >
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-center">
            <div className="text-sm w-full">
              还没有账号？{" "}
              <Link to="/register" className="font-medium text-pet-pink hover:underline">
                点击注册
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AuthPage;
