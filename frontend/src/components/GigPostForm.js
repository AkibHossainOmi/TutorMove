import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GIG_CREATION_ENDPOINT = `${process.env.REACT_APP_API_URL}/api/gigs/create/`;
const SUBJECTS_API = `${process.env.REACT_APP_API_URL}/api/subjects`;

const GigPostForm = ({ onClose, onGigCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [touchedFields, setTouchedFields] = useState({
    title: false,
    description: false,
    subject: false,
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(SUBJECTS_API);
        setSubjects(response.data);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      }
    };

    fetchSubjects();
  }, []);

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!title || !description || !subject) {
      setTouchedFields({
        title: true,
        description: true,
        subject: true,
      });
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const teacherId = storedUser?.user_id;

      if (!teacherId) {
        setError('User not logged in or teacher ID not found.');
        setIsLoading(false);
        return;
      }

      const newGigData = {
        title,
        description,
        subject,
        teacher: teacherId,
      };

      const response = await axios.post(GIG_CREATION_ENDPOINT, newGigData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccess('Gig created successfully!');
      onGigCreated(response.data);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error creating gig:', err);
      setError(err.response?.data?.detail || 'Failed to create gig. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isTitleValid = title.trim().length > 0;
  const isDescriptionValid = description.trim().length >= 20;
  const isSubjectValid = subject.trim().length > 0;
  const isFormValid = isTitleValid && isDescriptionValid && isSubjectValid;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-lg w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl leading-none transition-colors duration-200 rounded-full p-1 hover:bg-gray-100"
          aria-label="Close form"
        >
          &times;
        </button>

        <header className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Post a New Gig</h2>
          <p className="text-gray-500 text-sm">Showcase your expertise and connect with students</p>
        </header>

        {isLoading && (
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
            Creating gig...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-lg mb-4 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-800 p-3 rounded-lg mb-4 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="gigTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Gig Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="gigTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                touchedFields.title && !isTitleValid
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              placeholder="e.g., Advanced Calculus Tutor"
              required
            />
            {touchedFields.title && !isTitleValid && (
              <p className="mt-1 text-sm text-red-600">Please enter a gig title</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="gigDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="gigDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleBlur('description')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition min-h-[120px] resize-y ${
                touchedFields.description && !isDescriptionValid
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              placeholder="Describe your teaching style, experience, qualifications, etc."
              required
            />
            <div className="flex justify-between mt-1">
              {touchedFields.description && !isDescriptionValid ? (
                <p className="text-sm text-red-600">Description should be at least 20 characters</p>
              ) : (
                <p className="text-xs text-gray-500">Minimum 20 characters</p>
              )}
              <p className="text-xs text-gray-500">{description.length}/500</p>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label htmlFor="gigSubject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="gigSubject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={() => handleBlur('subject')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                touchedFields.subject && !isSubjectValid
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            {touchedFields.subject && !isSubjectValid && (
              <p className="mt-1 text-sm text-red-600">Please select a subject</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-md'
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                'Post Gig'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GigPostForm;
