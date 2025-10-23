import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Star,
  Award,
  Target,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `https://ai-resume-analyzer1-3.onrender.com/api/resume/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Full API response:', response.data);

      // ✅ Backend returns: { success: true, data: { resume: {...} } }
      const resumeData = response.data.data.resume;  // ← Access the nested resume object
      setResume(resumeData);

      console.log('Resume data:', resumeData);
      console.log('Resume keys:', Object.keys(resumeData));

      // ✅ With Prisma, analysis fields are already part of the resume object
      // No need to parse - they're separate columns: overallScore, strengths, weaknesses, suggestions, keySkills, summary
      const analysisData = {
        overallScore: resumeData.overallScore,
        strengths: resumeData.strengths || [],
        weaknesses: resumeData.weaknesses || [],
        suggestions: resumeData.suggestions || [],
        keySkills: resumeData.keySkills || [],
        summary: resumeData.summary || ''
      };

      console.log('Analysis data:', analysisData);
      setAnalysis(analysisData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('Failed to load analysis');
      setLoading(false);
    }
  };

  const downloadResume = () => {
    // Backend uses 'filePath' not 'fileUrl'
    if (resume?.filePath) {
      window.open(resume.filePath, '_blank');
      toast.success('Opening resume...');
    } else {
      toast.error('Resume file not found');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Analyzing Your Resume...
            </h2>
            <p className="text-gray-600">
              Our AI is reviewing your resume. This will take about 30 seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis || !resume) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Analysis Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the analysis for this resume.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Resume Analysis Results
            </h1>
            <p className="text-gray-600">
              Analyzed on {new Date(resume.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={downloadResume}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
          >
            <Download className="w-5 h-5" />
            <span>Download Resume</span>
          </button>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-2">Overall Resume Score</p>
              <h2 className="text-6xl font-bold mb-2">
                {analysis.overallScore || 'N/A'}
              </h2>
              <p className="text-blue-100">
                {analysis.overallScore >= 80 && 'Excellent! Your resume is strong'}
                {analysis.overallScore >= 60 && analysis.overallScore < 80 && 'Good! Some improvements recommended'}
                {analysis.overallScore < 60 && 'Needs improvement'}
              </p>
            </div>
            <div className="hidden md:block">
              <Award className="w-32 h-32 text-white opacity-20" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Skills */}
            {analysis.keySkills && analysis.keySkills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Key Skills Identified</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keySkills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Areas for Improvement</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions - FIXED: Backend sends "suggestions" not "recommendations" */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Suggestions for Improvement</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Overall Summary</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resume Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resume Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">File Name</p>
                  <p className="font-medium text-gray-800">{resume.fileName || 'Resume'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">File Size</p>
                  <p className="font-medium text-gray-800">
                    {resume.fileSize ? `${(resume.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uploaded</p>
                  <p className="font-medium text-gray-800">
                    {new Date(resume.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Analyzed
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <Link
                  to="/upload"
                  className="block w-full bg-white text-center text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition border border-gray-300"
                >
                  Upload Another Resume
                </Link>
                <Link
                  to="/dashboard"
                  className="block w-full bg-blue-600 text-center text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Pro Tips</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Update your resume based on the suggestions</li>
                <li>• Tailor it for each job application</li>
                <li>• Use keywords from job descriptions</li>
                <li>• Keep formatting clean and simple</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage;