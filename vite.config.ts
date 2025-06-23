import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 从环境变量获取API基础URL，如果没有设置则使用默认值
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'https://api.pawfect.ink';
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // 代理所有/api开头的请求到后端服务
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: apiBaseUrl.startsWith('https'),  // 根据协议自动设置
          followRedirects: true,  // 自动跟随重定向
          preserveHeaderKeyCase: true,  // 保留请求头大小写
          headers: {
            Connection: 'keep-alive'
          },
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('代理错误:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('代理请求:', req.method, req.url);
              // 确保Authorization头被传递
              if (req.headers.authorization) {
                console.log('发现认证头');
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('代理响应:', proxyRes.statusCode, req.url);
            });
          }
        },
        // 代理静态资源请求
        '/storage': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: apiBaseUrl.startsWith('https'),  // 根据协议自动设置
          followRedirects: true,  // 自动跟随重定向
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
