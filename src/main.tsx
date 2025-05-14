
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 设置页面背景为白色（Neo-brutalist通常使用白底黑字高对比度）
document.body.style.backgroundColor = '#FFFFFF';

createRoot(document.getElementById("root")!).render(<App />);
