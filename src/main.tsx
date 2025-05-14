
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 设置页面背景为白色（Kawaii通常使用白色或柔和的淡彩色）
document.body.style.backgroundColor = '#FFFFFF';

createRoot(document.getElementById("root")!).render(<App />);
