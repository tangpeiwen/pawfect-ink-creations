
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import GalleryPage from './pages/GalleryPage';
import CreatePage from './pages/CreatePage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
