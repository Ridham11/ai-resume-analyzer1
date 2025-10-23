import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Eye,
  Trash2,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    analysisDone: 0,
    avgScore: 0,
  });
  const [recentResumes, setRecentResumes] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch user info
      const userResponse = await axios.get('https://ai-resume-analyzer1-3.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userResponse.data.data.user);

      // Fetch all resumes
      const resumesResponse = await axios.get(
        'https://ai-resume-analyzer1-3.onrender.com/api/resume/my-resumes',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Resumes response:', resumesResponse.data);

      const { count, data } = resumesResponse.data;
      const resumes = data.resumes || [];

      // Calculate statistics
      const totalResumes = count || resumes.length;
      const analysisDone = totalResumes; // Every uploaded resume is analyzed

      // Calculate average score
      let avgScore = 0;
      if (resumes.length > 0) {
        const totalScore = resumes.reduce(
          (sum, resume) => sum + (resume.overallScore || 0),
          0
        );
        avgScore = Math.round(totalScore / resumes.length);
      }

      setStats({
        totalResumes,
        analysisDone,
        avgScore: avgScore || 0,
      });

      // Get recent resumes (top 5)
      setRecentResumes(resumes.slice(0, 5));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`https://ai-resume-analyzer1-3.onrender.com/api/resume/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Resume deleted successfully!');
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Loading Dashboard...
            </h2>
            <p className="text-gray-600">Please wait while we fetch your data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-600">
            {user?.name ? `Hi ${user.name}, ` : ''}Ready to optimize your resume with AI?
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Upload Resume Card */}
          <Link
            to="/upload"
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <Upload className="w-12 h-12" />
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                →
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Upload Resume</h3>
            <p className="text-blue-100">Upload a new resume for AI analysis</p>
          </Link>

          {/* My Resumes Card */}
          <Link
            to="/my-resumes"
            className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-12 h-12" />
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                →
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">My Resumes</h3>
            <p className="text-green-100">View all your uploaded resumes</p>
          </Link>

          {/* ATS Checker Card */}
          <Link
            to="/ats-check"
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-12 h-12" />
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                →
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">ATS Checker</h3>
            <p className="text-orange-100">Check resume against job description</p>
          </Link>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Statistics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Total Resumes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalResumes}
              </h3>
              <p className="text-gray-600 text-sm">Resumes Uploaded</p>
            </div>

            {/* Analysis Done */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-green-600 mb-2">
                {stats.analysisDone}
              </h3>
              <p className="text-gray-600 text-sm">Analysis Done</p>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-purple-600 mb-2">
                {stats.avgScore > 0 ? stats.avgScore : '-'}
              </h3>
              <p className="text-gray-600 text-sm">Avg Resume Score</p>
            </div>

            {/* ATS Checks - Coming Soon */}
            <div className="bg-white rounded-2xl shadow-lg p-6 opacity-60">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-orange-600 mb-2">-</h3>
              <p className="text-gray-600 text-sm">ATS Checks</p>
            </div>
          </div>
        </div>

        {/* Recent Resumes Section */}
        {recentResumes.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Resumes</h2>
              <Link
                to="/my-resumes"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            <div className="space-y-4">
              {recentResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {resume.fileName}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(resume.uploadedAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {resume.fileSize
                            ? `${(resume.fileSize / 1024).toFixed(2)} KB`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Score Badge */}
                    <div
                      className={`px-4 py-2 rounded-lg ${getScoreBgColor(
                        resume.overallScore
                      )}`}
                    >
                      <span
                        className={`font-bold ${getScoreColor(resume.overallScore)}`}
                      >
                        {resume.overallScore || 'N/A'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <button
                      onClick={() => navigate(`/analysis/${resume.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Analysis"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center border-2 border-dashed border-blue-200">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Upload your resume now and get instant AI-powered feedback in under 60
              seconds!
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Your First Resume
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;