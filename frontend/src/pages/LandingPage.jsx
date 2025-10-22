import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  Upload,
  BarChart3,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Users,
  TrendingUp,
  Check
} from 'lucide-react';

function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-800">AI Resume Analyzer</span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition">
                How It Works
              </a>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Resume Analysis</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Land Your Dream Job with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered
              </span>{' '}
              Resume Analysis
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Get instant feedback, ATS optimization, and actionable insights in seconds.
              Powered by Google Gemini AI to help you stand out from the competition.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>

              {/* fixed: proper opening <a> tag */}
              <a
                href="#how-it-works"
                className="w-full sm:w-auto bg-white text-gray-800 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-blue-600 transition flex items-center justify-center"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-6 text-gray-600 text-sm">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-600" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-600" />
                <span>Results in 60 seconds</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-600" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose AI Resume Analyzer?</h2>
            <p className="text-xl text-gray-600">
              Powerful features to optimize your resume and boost your job prospects
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced Google Gemini AI analyzes your resume content, structure, and formatting to provide detailed insights and recommendations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ATS Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                Ensure your resume passes Applicant Tracking Systems with keyword optimization and formatting that recruiters actually see.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-pink-600 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Results</h3>
              <p className="text-gray-600 leading-relaxed">
                Get comprehensive analysis in under 60 seconds. No waiting, no hassle. Upload, analyze, and improve immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Results in 3 Simple Steps</h2>
            <p className="text-xl text-gray-600">From upload to insights in less than a minute</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="text-blue-600 font-bold text-lg mb-2">STEP 1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Resume</h3>
              <p className="text-gray-600">Upload your resume in PDF or DOCX format. Quick and secure upload process.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="text-purple-600 font-bold text-lg mb-2">STEP 2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analyzes</h3>
              <p className="text-gray-600">Our AI scans your resume for strengths, weaknesses, and optimization opportunities.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div className="text-pink-600 font-bold text-lg mb-2">STEP 3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Results</h3>
              <p className="text-gray-600">Receive detailed feedback with actionable recommendations to improve your resume.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect For Everyone</h2>
            <p className="text-xl text-gray-600">Whether you are starting out or advancing your career</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="bg-blue-50 p-6 rounded-xl text-center hover:shadow-lg transition">
              <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Students & Graduates</h3>
              <p className="text-gray-600 text-sm">Launch your career with a standout resume</p>
            </div>

            {/* Card 2 */}
            <div className="bg-purple-50 p-6 rounded-xl text-center hover:shadow-lg transition">
              <Briefcase className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Job Seekers</h3>
              <p className="text-gray-600 text-sm">Optimize your resume for your target roles</p>
            </div>

            {/* Card 3 */}
            <div className="bg-pink-50 p-6 rounded-xl text-center hover:shadow-lg transition">
              <Users className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Career Changers</h3>
              <p className="text-gray-600 text-sm">Highlight transferable skills effectively</p>
            </div>

            {/* Card 4 */}
            <div className="bg-green-50 p-6 rounded-xl text-center hover:shadow-lg transition">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Professionals</h3>
              <p className="text-gray-600 text-sm">Stay competitive in your industry</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Optimize Your Resume?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have improved their resumes with AI. Get started for free in less than 60 seconds.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-xl"
          >
            Create Free Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            {/* Brand */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl font-bold">AI Resume Analyzer</h3>
            </div>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Optimize your resume with AI-powered analysis and land your dream job faster.
            </p>

            {/* Social Links */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-4">Connect with the Creator</p>
              <div className="flex flex-wrap justify-center items-center gap-6">
                <a href="mailto:ridham123.mishra@gmail.com" className="text-gray-400 hover:text-white transition text-sm" title="Email">Email</a>
                <a href="https://instagram.com/yourhandle" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400 transition text-sm" title="Instagram">Instagram</a>
                <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm" title="GitHub">GitHub</a>
                <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition text-sm" title="Twitter">Twitter</a>
                <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition text-sm" title="LinkedIn">LinkedIn</a>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">&copy; 2025 AI Resume Analyzer. All rights reserved.</p>
              <p className="text-gray-600 text-xs mt-2">Built with love by Ridham Mishra</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
