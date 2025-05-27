import { useUser } from "@clerk/clerk-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Mail, Calendar } from "lucide-react";

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
  
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
          <Card className="col-span-1 md:col-span-2 shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>基本信息</CardTitle>
              <CardDescription>您的个人账户信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-pet-pink">
                  {user?.hasImage ? (
                    <img 
                      src={user?.imageUrl} 
                      alt={user?.fullName || "用户头像"} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <UserCircle className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {user?.fullName || user?.username || "萌宠用户"}
                  </h3>
                  <p className="text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress || "未设置邮箱"}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">邮箱: </span>
                  <span>{user?.primaryEmailAddress?.emailAddress || "未设置"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">注册于: </span>
                  <span>
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : "未知"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 右侧卡片 - 可以放置更多信息 */}
          <Card className="col-span-1 shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>账户状态</CardTitle>
              <CardDescription>您的账户信息概览</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">账户状态:</span>
                  <span className="font-medium text-green-500">活跃</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">账户类型:</span>
                  <span className="font-medium">普通用户</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最近登录:</span>
                  <span className="font-medium">
                    {user?.lastSignInAt 
                      ? new Date(user.lastSignInAt).toLocaleDateString('zh-CN', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "未知"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 