import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  BarChart3,
  ArrowLeft,
  FileText,
  Briefcase,
  CheckCircle,
  XCircle,
  TrendingUp,
  Loader2,
  AlertCircle,
  Target,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function ATSCheck() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://ai-resume-analyzer1-3.onrender.com/api/resume/my-resumes',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resumesList = response.data.data.resumes || [];
      setResumes(resumesList);
      setLoadingResumes(false);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
      setLoadingResumes(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please paste the job description');
      return;
    }

    if (jobDescription.length < 50) {
      toast.error('Job description is too short. Please provide more details.');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'https://ai-resume-analyzer1-3.onrender.com/api/analysis/ats-check',
        {
          resumeId: parseInt(selectedResumeId),
          jobDescription: jobDescription.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('ATS Check response:', response.data);

      if (response.data.success) {
        setResults(response.data.data);
        toast.success('ATS compatibility checked successfully!');
        
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }, 100);
      }

      setLoading(false);
    } catch (error) {
      console.error('ATS check error:', error);
      toast.error(error.response?.data?.message || 'Failed to check ATS compatibility');
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match!';
    if (score >= 60) return 'Good Match';
    return 'Needs Improvement';
  };

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ATS Checker</h1>
          <p className="text-gray-600">
            Check how well your resume matches a specific job description
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Resume Selection */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    1. Select Your Resume
                  </h3>
                </div>

                {loadingResumes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <p className="text-gray-700 mb-4">
                      You don't have any resumes uploaded yet.
                    </p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Upload Resume
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes.map((resume) => (
                      <label
                        key={resume.id}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedResumeId === resume.id.toString()
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="resume"
                          value={resume.id}
                          checked={selectedResumeId === resume.id.toString()}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-semibold text-gray-800">
                            {resume.fileName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Score: {resume.overallScore || 'N/A'} •{' '}
                            {new Date(resume.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Job Description */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    2. Paste Job Description
                  </h3>
                </div>

                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here...&#10;&#10;Include:&#10;- Job title&#10;- Required skills&#10;- Responsibilities&#10;- Qualifications&#10;- Experience needed"
                  className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={loading}
                />

                <p className="text-sm text-gray-500 mt-2">
                  {jobDescription.length} characters (minimum 50 required)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex items-center justify-center">
              <button
                type="submit"
                disabled={loading || resumes.length === 0 || !selectedResumeId || !jobDescription}
                className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Analyzing Match...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Check ATS Compatibility</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {results && (
          <div id="results-section" className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                ATS Compatibility Results
              </h2>
              <p className="text-gray-600">
                Here's how well your resume matches this job
              </p>
            </div>

            {/* Score Card */}
            <div
              className={`bg-gradient-to-br ${getScoreBgColor(
                results.atsScore
              )} rounded-2xl p-8 text-white shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white text-opacity-90 mb-2">
                    ATS Compatibility Score
                  </p>
                  <h2 className="text-6xl font-bold mb-2">{results.atsScore}%</h2>
                  <p className="text-xl">{getScoreLabel(results.atsScore)}</p>
                  <p className="mt-4 text-white text-opacity-90">
                    Match Percentage: {results.matchPercentage}%
                  </p>
                </div>
                <div className="hidden md:block">
                  <Target className="w-32 h-32 text-white opacity-20" />
                </div>
              </div>
            </div>

            {/* Summary */}
            {results.summary && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Summary</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {results.summary}
                </p>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Matched Keywords */}
              {results.matchedKeywords && results.matchedKeywords.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Matched Keywords
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.matchedKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{keyword}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {results.missingKeywords && results.missingKeywords.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Missing Keywords
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{keyword}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Recommendations
                  </h3>
                </div>
                <ul className="space-y-3">
                  {results.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg"
                    >
                      <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                What's Next?
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => {
                    setResults(null);
                    setJobDescription('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition border border-gray-300"
                >
                  Check Another Job
                </button>
                <Link
                  to="/my-resumes"
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View All Resumes
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ATSCheck;