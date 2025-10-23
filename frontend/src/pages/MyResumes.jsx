import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  FileText,
  Calendar,
  Eye,
  Trash2,
  Download,
  ArrowLeft,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function MyResumes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'score', 'name'

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    filterAndSortResumes();
  }, [searchQuery, sortBy, resumes]);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        'https://ai-resume-analyzer1-3.onrender.com/api/resume/my-resumes',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('My resumes response:', response.data);

      const { data } = response.data;
      const resumesList = data.resumes || [];

      setResumes(resumesList);
      setFilteredResumes(resumesList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
      setLoading(false);
    }
  };

  const filterAndSortResumes = () => {
    let filtered = [...resumes];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((resume) =>
        resume.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      } else if (sortBy === 'score') {
        return (b.overallScore || 0) - (a.overallScore || 0);
      } else if (sortBy === 'name') {
        return a.fileName.localeCompare(b.fileName);
      }
      return 0;
    });

    setFilteredResumes(filtered);
  };

  const handleDeleteResume = async (resumeId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`https://ai-resume-analyzer1-3.onrender.com/api/resume/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Resume deleted successfully!');

      // Remove from local state
      setResumes(resumes.filter((r) => r.id !== resumeId));
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const downloadResume = async (filePath, fileName) => {
    if (!filePath) {
      toast.error('Resume file not found');
      return;
    }

    try {
      toast.loading('Preparing download...');
      
      // Fetch the file as a blob
      const response = await fetch(filePath);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      
      // Create a blob URL and download it
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
      toast.dismiss();
      toast.success(`Downloaded ${fileName}!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      // Fallback: just open in new tab
      window.open(filePath, '_blank');
      toast.success(`Opening ${fileName} in new tab...`);
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

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Loading Your Resumes...
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
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Resumes</h1>
          <p className="text-gray-600">
            View and manage all your uploaded resumes ({resumes.length} total)
          </p>
        </div>

        {/* Search and Filter Bar */}
        {resumes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resumes by filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-3">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="mt-4 text-sm text-gray-600">
                Found {filteredResumes.length} resume(s) matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Resumes Grid */}
        {filteredResumes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Card Header with Score */}
                <div
                  className={`p-6 ${getScoreBgColor(
                    resume.overallScore
                  )} border-b-4 border-white`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                      <FileText className={`w-6 h-6 ${getScoreColor(resume.overallScore)}`} />
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(resume.overallScore)}`}>
                        {resume.overallScore || 'N/A'}
                      </div>
                      <div className={`text-xs font-medium ${getScoreColor(resume.overallScore)}`}>
                        {resume.overallScore ? getScoreLabel(resume.overallScore) : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-3 truncate text-lg" title={resume.fileName}>
                    {resume.fileName}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        {resume.fileSize ? `${(resume.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Summary (if available) */}
                  {resume.summary && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {resume.summary}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/analysis/${resume.id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => downloadResume(resume.filePath, resume.fileName)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteResume(resume.id, resume.fileName)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center border-2 border-dashed border-blue-200">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {searchQuery ? 'No Resumes Found' : 'No Resumes Yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No resumes match "${searchQuery}". Try a different search term.`
                : "You haven't uploaded any resumes yet. Upload your first resume to get started!"}
            </p>
            {!searchQuery && (
              <Link
                to="/upload"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
              >
                <FileText className="w-5 h-5 mr-2" />
                Upload Your First Resume
              </Link>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyResumes;