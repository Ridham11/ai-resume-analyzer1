import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';    // ✅ Correct
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import MyResumesPage from './pages/MyResumes';        // ✅ NEW
import ATSCheckPage from './pages/ATSCheck';          // ✅ NEW

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public Route Component (redirect to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />

        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/analysis/:id" 
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          } 
        />

        {/* ✅ NEW ROUTES */}
        <Route 
          path="/my-resumes" 
          element={
            <ProtectedRoute>
              <MyResumesPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ats-check" 
          element={
            <ProtectedRoute>
              <ATSCheckPage />
            </ProtectedRoute>
          } 
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;