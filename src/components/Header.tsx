
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Circle, PawPrint } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-sketch-paper py-6 border-b-2 border-sketch-ink">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-12 h-12 border-2 border-sketch-ink bg-sketch-paper rounded-full flex items-center justify-center relative">
            <PawPrint className="w-7 h-7 text-sketch-primary" strokeWidth={2.5} />
            <Circle className="absolute -top-1 -right-1 w-3 h-3 text-sketch-accent" fill="#F9C784" strokeWidth={1} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-sketch font-bold text-sketch-ink">萌宠纹身</span>
            <span className="text-xs text-sketch-ink/80 font-handwriting -mt-1">Pet Tattoo</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-sketch hover:text-sketch-primary transition-colors">首页</Link>
          <Link to="/gallery" className="font-sketch hover:text-sketch-primary transition-colors">作品展示</Link>
          <Link to="/pricing" className="font-sketch hover:text-sketch-primary transition-colors">价格套餐</Link>
          <Link to="/about" className="font-sketch hover:text-sketch-primary transition-colors">关于我们</Link>
          <Link to="/create">
            <button className="sketch-button-primary">
              <PawPrint className="w-5 h-5 mr-1" />
              开始制作
            </button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-sketch-ink"
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
        <div className="md:hidden container mt-4 pb-4 bg-sketch-paper sketch-card">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="font-sketch hover:text-sketch-primary transition-colors p-2">首页</Link>
            <Link to="/gallery" className="font-sketch hover:text-sketch-primary transition-colors p-2">作品展示</Link>
            <Link to="/pricing" className="font-sketch hover:text-sketch-primary transition-colors p-2">价格套餐</Link>
            <Link to="/about" className="font-sketch hover:text-sketch-primary transition-colors p-2">关于我们</Link>
            <Link to="/create">
              <button className="sketch-button-primary w-full">
                <PawPrint className="w-5 h-5 mr-1" />
                开始制作
              </button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
