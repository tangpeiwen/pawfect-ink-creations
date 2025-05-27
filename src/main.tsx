import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 渲染主应用
createRoot(document.getElementById("root")!).render(
  <App />
);

// 仅在开发环境下加载stagewise工具栏
if (import.meta.env.DEV) {
  // 创建stagewise配置
  const stagewiseConfig = {
    plugins: []
  };

  // 为工具栏创建单独的DOM元素和React根
  const toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'stagewise-toolbar-root';
  document.body.appendChild(toolbarContainer);

  // 动态导入工具栏组件并渲染
  import('@stagewise/toolbar-react').then(({ StagewiseToolbar }) => {
    createRoot(toolbarContainer).render(
      <StagewiseToolbar config={stagewiseConfig} />
    );
  });
}
