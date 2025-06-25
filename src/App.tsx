import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from './pages/Index';
import GalleryPage from './pages/GalleryPage';
import CreatePage from './pages/CreatePage';
import MyWorksPage from './pages/MyWorksPage';
// import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import ProductSelectionPage from './pages/ProductSelectionPage';
import OrderConfirmPage from './pages/OrderConfirmPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import PaymentResult from './pages/PaymentResult';
import { Toaster } from './components/ui/toaster';

// 创建一个基本应用
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gallery" element={<GalleryPage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/sign-in" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          {/* 受保护的路由 - 需要登录才能访问 */}
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreatePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-works" 
            element={
              <ProtectedRoute>
                <MyWorksPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/product-selection" 
            element={
              <ProtectedRoute>
                <ProductSelectionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order-confirm" 
            element={
              <ProtectedRoute>
                <OrderConfirmPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order-success" 
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
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
