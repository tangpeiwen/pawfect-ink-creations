
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Circle } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white py-4">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-kawaii-pink rounded-full flex items-center justify-center animate-pulse-soft">
            <Heart className="w-7 h-7 text-white" fill="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-display font-bold text-kawaii-pink">萌宠纹身</span>
            <span className="text-xs text-kawaii-text -mt-1">Pet Tattoo</span>
          </div>
          <Circle className="w-3 h-3 text-kawaii-yellow animate-bounce-small" fill="#FEF7CD" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium hover:text-kawaii-pink transition-colors">首页</Link>
          <Link to="/gallery" className="font-medium hover:text-kawaii-pink transition-colors">作品展示</Link>
          <Link to="/pricing" className="font-medium hover:text-kawaii-pink transition-colors">价格套餐</Link>
          <Link to="/about" className="font-medium hover:text-kawaii-pink transition-colors">关于我们</Link>
          <Link to="/create">
            <Button className="bg-kawaii-pink hover:bg-kawaii-pink/90 text-white px-6 py-2 rounded-full font-display">
              <Heart className="w-5 h-5 mr-1" />
              开始制作
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-kawaii-text"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container mt-4 pb-4 bg-white rounded-3xl shadow-md">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="font-medium hover:text-kawaii-pink transition-colors p-2">首页</Link>
            <Link to="/gallery" className="font-medium hover:text-kawaii-pink transition-colors p-2">作品展示</Link>
            <Link to="/pricing" className="font-medium hover:text-kawaii-pink transition-colors p-2">价格套餐</Link>
            <Link to="/about" className="font-medium hover:text-kawaii-pink transition-colors p-2">关于我们</Link>
            <Link to="/create">
              <Button className="bg-kawaii-pink hover:bg-kawaii-pink/90 text-white px-6 py-2 w-full rounded-full font-display">
                <Heart className="w-5 h-5 mr-1" />
                开始制作
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
