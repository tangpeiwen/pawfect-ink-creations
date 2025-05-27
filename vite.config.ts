import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // 代理所有/api开头的请求到后端服务器
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // 可以重写路径，但这里我们不需要
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // 跳过SSL证书验证
        rejectUnauthorized: false,
      },
      // 代理静态资源请求
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rejectUnauthorized: false,
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
}));
