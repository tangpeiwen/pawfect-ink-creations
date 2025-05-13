
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-pet-pink rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">萌</span>
              </div>
              <span className="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-pet">萌宠纹身</span>
            </div>
            <p className="text-sm text-gray-500">
              把您珍爱的宠物变成独一无二的纹身贴，留下永恒的记忆
            </p>
          </div>
          
          <div>
            <h3 className="font-display font-bold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-500 hover:text-pet-pink">首页</Link></li>
              <li><Link to="/gallery" className="text-gray-500 hover:text-pet-pink">作品展示</Link></li>
              <li><Link to="/pricing" className="text-gray-500 hover:text-pet-pink">价格套餐</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-pet-pink">关于我们</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold mb-4">帮助支持</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="text-gray-500 hover:text-pet-pink">常见问题</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-pet-pink">联系我们</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-pet-pink">使用条款</Link></li>
              <li><Link to="/privacy" className="text-gray-500 hover:text-pet-pink">隐私政策</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold mb-4">联系我们</h3>
            <p className="text-sm text-gray-500 mb-2">邮箱: contact@pengwenshen.com</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-pet-pink">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-pet-pink">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-pet-pink">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} 萌宠纹身 版权所有</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
