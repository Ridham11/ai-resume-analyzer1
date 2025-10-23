import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx'];

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    // Validate file type
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF or DOCX file only');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    toast.success('File selected! Ready to upload.');
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload file to backend
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('token');

      const response = await axios.post(
        'https://ai-resume-analyzer1-3.onrender.com/api/resume/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

     console.log('Upload response:', response.data);
console.log('Resume ID:', response.data.data?.resume?.id);
console.log('Full resume object:', response.data.data?.resume);

      toast.success('Resume uploaded successfully!');
      
      // Redirect to analysis results page with resume ID
      const resumeId = response.data.data.resume.id;
      setTimeout(() => {
        navigate(`/analysis/${resumeId}`);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Upload Your Resume
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your resume and get instant AI-powered analysis in under 60 seconds
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  {!file ? (
                    <>
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-10 h-10 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-800 mb-2">
                          Drag & drop your resume here
                        </p>
                        <p className="text-gray-500 mb-4">or</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                        >
                          Browse Files
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Supported formats: PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </>
                  ) : (
                    <>
                      {/* Selected File Preview */}
                      <div className="w-full">
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-800">{file.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          {!uploading && (
                            <button
                              onClick={removeFile}
                              className="p-2 hover:bg-gray-200 rounded-full transition"
                            >
                              <X className="w-5 h-5 text-gray-600" />
                            </button>
                          )}
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Uploading...
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {uploadProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Upload Button */}
                        {!uploading ? (
                          <button
                            onClick={handleUpload}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center"
                          >
                            <Upload className="w-5 h-5 mr-2" />
                            Upload & Analyze
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center"
                          >
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Uploading...
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                What happens next?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">AI Analysis</p>
                    <p className="text-sm text-gray-600">
                      Our AI will analyze your resume content, structure, and formatting
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">ATS Score</p>
                    <p className="text-sm text-gray-600">
                      Get an ATS compatibility score and optimization tips
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Recommendations</p>
                    <p className="text-sm text-gray-600">
                      Receive actionable suggestions to improve your resume
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Tips for best results:</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Use a clear, readable font</li>
                    <li>• Include relevant keywords</li>
                    <li>• Keep formatting consistent</li>
                    <li>• Avoid images or graphics</li>
                    <li>• Use standard section headings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;