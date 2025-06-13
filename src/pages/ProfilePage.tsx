import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Mail, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      } else {
        navigate("/sign-in");
      }
      setIsLoaded(true);
    };

    checkUser();
  }, [navigate]);
  
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 个人信息卡片 */}
          <Card className="md:col-span-2">
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
          
          {/* 统计信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>使用统计</CardTitle>
              <CardDescription>
                您的使用情况
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pet-pink">0</div>
                <div className="text-sm text-gray-600">生成的贴纸</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pet-pink">0</div>
                <div className="text-sm text-gray-600">收藏的作品</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 