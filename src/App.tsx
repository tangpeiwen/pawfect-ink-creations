import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from './pages/Index';
import GalleryPage from './pages/GalleryPage';
import CreatePage from './pages/CreatePage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import { Toaster } from './components/ui/toaster';

// 创建一个基本应用
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/sign-in" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* 受保护的路由 - 需要登录才能访问 */}
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreatePage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
