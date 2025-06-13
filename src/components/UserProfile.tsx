import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function UserProfile() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

  // 处理登出
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      toast({
        title: "已退出登录",
        description: "您已成功退出登录",
      });
    } catch (error) {
      console.error("登出失败:", error);
      toast({
        title: "退出失败",
        description: "退出登录时发生错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // 获取用户显示名称
  const getDisplayName = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "用户";
  };

  // 获取用户头像缩写
  const getAvatarFallback = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative p-0 h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url || ""} />
              <AvatarFallback className="bg-pet-pink text-white">
                {getAvatarFallback()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="w-full cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? "正在退出..." : "退出登录"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" className="font-medium">
        <Link to="/sign-in">登录</Link>
      </Button>
      <Button asChild className="font-medium bg-pet-pink text-white hover:bg-pet-pink/90">
        <Link to="/register">注册</Link>
      </Button>
    </div>
  );
} 