import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import apiService from '../utils/apiService';

const TutorApplicationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);

  const [formData, setFormData] = useState({
    reason: '',
    subjects: '',
    experience: '',
    qualifications: ''
  });

  useEffect(() => {
    // Check if user already has an application
    const checkExistingApplication = async () => {
      try {
        const response = await apiService.get('/api/tutor-applications/');
        if (response.data && response.data.length > 0) {
          const pending = response.data.find(app => app.status === 'pending');
          if (pending) {
            setExistingApplication(pending);
          }
        }
      } catch (err) {
        console.error('Error checking existing application:', err);
      }
    };
    checkExistingApplication();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert subjects string to array
      const subjects = formData.subjects.split(',').map(s => s.trim()).filter(Boolean);

      const applicationData = {
        reason: formData.reason,
        subjects: subjects,
        experience: formData.experience,
        qualifications: formData.qualifications
      };

      await apiService.post('/api/tutor-applications/', applicationData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (existingApplication) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⏳</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Pending</h2>
                <p className="text-gray-600 mb-6">
                  You already have a pending tutor application. Please wait for admin review.
                </p>
                <div className="bg-blue-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Application Details:</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Submitted:</strong> {new Date(existingApplication.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Status:</strong> <span className="capitalize">{existingApplication.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-20 pb-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                <p className="text-gray-600 mb-6">
                  Your tutor application has been submitted successfully. You will be notified once an admin reviews your application.
                </p>
                <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎓</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply to be a Tutor</h1>
              <p className="text-gray-600">
                Fill out the form below to apply for tutor privileges. Once approved, you'll be able to switch between student and tutor roles.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                  Why do you want to become a tutor? *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Explain your motivation and what you hope to achieve as a tutor..."
                />
              </div>

              <div>
                <label htmlFor="subjects" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subjects you can teach * <span className="text-xs text-gray-500 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  id="subjects"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-2">
                  Teaching Experience
                </label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your previous teaching or tutoring experience (if any)..."
                />
              </div>

              <div>
                <label htmlFor="qualifications" className="block text-sm font-semibold text-gray-700 mb-2">
                  Educational Qualifications
                </label>
                <textarea
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="List your degrees, certifications, or relevant qualifications..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TutorApplicationPage;
