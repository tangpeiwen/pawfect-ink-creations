import { Link } from "react-router-dom";
import { PawPrint, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-12 pb-6">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-pet-pink rounded-full flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-pet-pink">萌宠纹身</span>
            </Link>
            <p className="mt-4 text-gray-500 text-sm">
              让您的宠物变成可爱的纹身贴，<br />
              伴您左右，是我们的使命。
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="bg-pet-pink/10 hover:bg-pet-pink/20 w-8 h-8 rounded-full flex items-center justify-center text-pet-pink transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z" /></svg>
              </a>
              <a href="#" className="bg-pet-pink/10 hover:bg-pet-pink/20 w-8 h-8 rounded-full flex items-center justify-center text-pet-pink transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z" /></svg>
              </a>
              <a href="#" className="bg-pet-pink/10 hover:bg-pet-pink/20 w-8 h-8 rounded-full flex items-center justify-center text-pet-pink transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231l5.45-6.231Zm-1.161 17.52h1.833L7.045 4.126H5.078L17.044 19.77Z" /></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-4">快速链接</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-500 hover:text-pet-pink transition-colors">首页</Link>
              <Link to="/gallery" className="text-gray-500 hover:text-pet-pink transition-colors">作品展示</Link>
              <Link to="/about" className="text-gray-500 hover:text-pet-pink transition-colors">关于我们</Link>
              <Link to="/pricing" className="text-gray-500 hover:text-pet-pink transition-colors">价格方案</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-4">客户服务</h3>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-gray-500 hover:text-pet-pink transition-colors">联系我们</a>
              <a href="#" className="text-gray-500 hover:text-pet-pink transition-colors">常见问题</a>
              <a href="#" className="text-gray-500 hover:text-pet-pink transition-colors">退款政策</a>
              <a href="#" className="text-gray-500 hover:text-pet-pink transition-colors">使用指南</a>
            </nav>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-4">联系我们</h3>
            <p className="text-gray-500">客服邮箱: support@mengchong.com</p>
            <p className="text-gray-500 mt-2">工作时间: 周一至周五 9:00-18:00</p>
            <div className="mt-4 bg-white rounded-xl p-4 border border-pet-pink/20">
              <p className="text-sm font-medium text-gray-700">订阅我们的电子报</p>
              <div className="mt-2 flex">
                <input type="email" placeholder="您的邮箱地址" className="flex-1 rounded-l-full border-y border-l border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pet-pink" />
                <button className="bg-gradient-pet text-white rounded-r-full px-4 py-2 text-sm">订阅</button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-10 pt-6 text-center flex flex-col items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} 萌宠纹身贴. 版权所有.
          </p>
          <div className="flex items-center text-pet-pink mt-2 text-sm justify-center">
            <Heart className="h-4 w-4 mr-1 fill-pet-pink" />
            用爱设计，为爱创造
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
