
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add an SVG filter to the document for the hand-drawn effect
const svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svgFilter.setAttribute('width', '0');
svgFilter.setAttribute('height', '0');
svgFilter.style.position = 'absolute';
svgFilter.style.visibility = 'hidden';
svgFilter.innerHTML = `
  <filter id="sketch-filter">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
  </filter>
`;
document.body.appendChild(svgFilter);

// 设置页面背景为纸质效果
document.body.style.backgroundColor = '#F9F6F0';

createRoot(document.getElementById("root")!).render(<App />);
