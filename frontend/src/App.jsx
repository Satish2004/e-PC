import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/Navbar';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Lenis from 'lenis';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token } = useAuthStore();
  if (!user || !token) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={user.role === 'Admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <Preloader />
      <CustomCursor />
      <Navbar />
      <div className="min-h-screen font-sans bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="Admin">
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <Chatbot />
    </Router>
  );
};

export default App;
