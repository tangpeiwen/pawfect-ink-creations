import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cat, LogIn, UserCircle, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // 检查当前会话状态
    const checkAuthState = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        setIsSignedIn(true);
        setUserEmail(data.session.user.email);
      } else {
        setIsSignedIn(false);
        setUserEmail(null);
      }
    };

    checkAuthState();

    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsSignedIn(true);
          setUserEmail(session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setIsSignedIn(false);
          setUserEmail(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white py-4 shadow-sm">
      <div className="container px-8 md:px-12 lg:px-16 mx-auto max-w-6xl flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/images/Cat.svg" alt="猫咪" className="w-12 h-12" />
          <img src="/images/Pawfect.svg" alt="Pawfect" className="h-8" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium hover:text-pet-pink transition-colors">首页</Link>
          <Link to="/gallery" className="font-medium hover:text-pet-pink transition-colors">作品展示</Link>
          <Link to="/pricing" className="font-medium hover:text-pet-pink transition-colors">价格套餐</Link>
          <Link to="/about" className="font-medium hover:text-pet-pink transition-colors">关于我们</Link>
          <Link to="/create">
            <Button className="bg-pet-pink text-white px-6 py-2 rounded-full hover:bg-pet-pink/90">
              <Cat className="w-5 h-5 mr-1" />
              开始制作
            </Button>
          </Link>
          {isSignedIn ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <UserCircle className="w-5 h-5 mr-2" />
                <span className="truncate max-w-[150px]">{userEmail || '用户'}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-500 hover:text-red-500"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/sign-in">
              <Button variant="outline" className="border-2 border-black px-4 py-2 rounded-full hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all">
                <LogIn className="w-4 h-4 mr-1" />
                登录
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container px-8 md:px-12 lg:px-16 mx-auto max-w-6xl mt-4 pb-4 bg-white rounded-2xl shadow-md">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="font-medium hover:text-pet-pink transition-colors p-2">首页</Link>
            <Link to="/gallery" className="font-medium hover:text-pet-pink transition-colors p-2">作品展示</Link>
            <Link to="/pricing" className="font-medium hover:text-pet-pink transition-colors p-2">价格套餐</Link>
            <Link to="/about" className="font-medium hover:text-pet-pink transition-colors p-2">关于我们</Link>
            <Link to="/create">
              <Button className="bg-pet-pink text-white px-6 py-2 w-full rounded-full hover:bg-pet-pink/90">
                <Cat className="w-5 h-5 mr-1" />
                开始制作
              </Button>
            </Link>
            {isSignedIn ? (
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center">
                  <UserCircle className="w-5 h-5 mr-2" />
                  <span className="truncate max-w-[150px]">{userEmail || '用户'}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/sign-in">
                <Button variant="outline" className="border-2 border-black px-6 py-2 w-full rounded-full hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all">
                  <LogIn className="w-4 h-4 mr-1" />
                  登录
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;