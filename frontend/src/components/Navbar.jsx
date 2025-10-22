import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LogOut, User, FileText, Upload, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">AI Resume Analyzer</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/upload" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Resume</span>
            </Link>
            
            <Link 
              to="/my-resumes" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
            >
              <FileText className="w-5 h-5" />
              <span>My Resumes</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-gray-700">
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;