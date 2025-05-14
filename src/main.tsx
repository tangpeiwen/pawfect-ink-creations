
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 设置页面背景
document.body.style.backgroundColor = '#121212';

createRoot(document.getElementById("root")!).render(<App />);
