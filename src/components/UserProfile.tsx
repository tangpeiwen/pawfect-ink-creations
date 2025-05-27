import { useState } from "react";
import { 
  UserButton, 
  useUser, 
  useClerk, 
  SignedIn, 
  SignedOut 
} from "@clerk/clerk-react";
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
import { PawPrint, LogOut, User as UserIcon } from "lucide-react";

export function UserProfile() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // 处理登出
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      // 登出后会自动重定向到首页
    } catch (error) {
      console.error("登出失败:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <SignedIn>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative p-0 h-10 w-10 rounded-full">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonTrigger: "h-10 w-10",
                    userButtonAvatarBox: "h-10 w-10",
                  }
                }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName || user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
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
      </SignedIn>

      <SignedOut>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="font-medium">
            <Link to="/sign-in">登录</Link>
          </Button>
          <Button asChild className="font-medium bg-pet-pink text-white hover:bg-pet-pink/90">
            <Link to="/sign-up">注册</Link>
          </Button>
        </div>
      </SignedOut>
    </>
  );
} 