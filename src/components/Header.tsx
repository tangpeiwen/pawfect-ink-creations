import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cat, Menu, X } from "lucide-react";
import { UserProfile } from "@/components/UserProfile";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <Link to="/my-works" className="font-medium hover:text-pet-pink transition-colors">我的作品</Link>
          <Link to="/pricing" className="font-medium hover:text-pet-pink transition-colors">价格套餐</Link>
          {/* <Link to="/about" className="font-medium hover:text-pet-pink transition-colors">关于我们</Link> */}
          <Link to="/create">
            <Button className="bg-pet-pink text-white px-6 py-2 rounded-full hover:bg-pet-pink/90">
              <Cat className="w-5 h-5 mr-1" />
              开始制作
            </Button>
          </Link>
          
          <UserProfile />
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
            <Link to="/my-works" className="font-medium hover:text-pet-pink transition-colors p-2">我的作品</Link>
            <Link to="/pricing" className="font-medium hover:text-pet-pink transition-colors p-2">价格套餐</Link>
            {/* <Link to="/about" className="font-medium hover:text-pet-pink transition-colors p-2">关于我们</Link> */}
            <Link to="/create">
              <Button className="bg-pet-pink text-white px-6 py-2 w-full rounded-full hover:bg-pet-pink/90">
                <Cat className="w-5 h-5 mr-1" />
                开始制作
              </Button>
            </Link>
            
            {/* 移动端用户认证 */}
            <div className="p-2">
              <UserProfile />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;