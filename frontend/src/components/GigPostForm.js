import React, { useState, useEffect } from 'react';
import { gigApi, subjectApi } from '../utils/apiService';
import CreatableSelect from "react-select/creatable";

const GigPostForm = ({ onClose, onGigCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [feeDetails, setFeeDetails] = useState('');
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [touchedFields, setTouchedFields] = useState({
    title: false,
    description: false,
    feeDetails: false,
    subject: false,
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectApi.getSubjects();
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

    // Basic validations for required fields
    if (!title || !description || !feeDetails || !subject) {
      setTouchedFields({
        title: true,
        description: true,
        feeDetails: true,
        subject: true,
      });
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const tutorId = storedUser?.user_id;

      if (!tutorId) {
        setError('User not logged in or tutor ID not found.');
        setIsLoading(false);
        return;
      }

      const newGigData = {
        tutor: tutorId,
        title,
        description,
        message,
        phone,
        education,
        experience,
        fee_details: feeDetails,
        subject,
      };

      const response = await gigApi.createGig(newGigData);

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
  const isFeeDetailsValid = feeDetails.trim().length > 0;
  const isSubjectValid = subject.trim().length > 0;
  const isFormValid = isTitleValid && isDescriptionValid && isFeeDetailsValid && isSubjectValid;

  const RequiredLabel = ({ label }) => (
    <span className="block text-sm font-semibold text-gray-700 mb-1">
      {label} <span className="text-red-500">*</span>
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create a Gig</h2>
            <p className="text-gray-500 text-sm mt-1">Share your expertise with students</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
            aria-label="Close form"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {isLoading && (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-center justify-center shadow-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              Creating your gig...
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-start shadow-sm border border-red-100">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-start shadow-sm border border-green-100">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          )}

          <form id="gigForm" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <RequiredLabel label="Gig Title" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur('title')}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition shadow-sm ${
                  touchedFields.title && !isTitleValid
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                }`}
                placeholder="e.g., Expert Math Tutor for High School"
              />
              {touchedFields.title && !isTitleValid && (
                <p className="mt-1 text-sm text-red-500">Please provide a title for your gig.</p>
              )}
            </div>

            {/* Subject Dropdown */}
            <div>
              <RequiredLabel label="Subject" />
              <CreatableSelect
                isClearable
                placeholder="Select or type a subject..."
                value={subject ? { value: subject, label: subject } : null}
                onChange={(selected) => setSubject(selected ? selected.value : "")}
                onBlur={() => handleBlur("subject")}
                options={subjects.map((item) => ({ value: item.name, label: item.name }))}
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: '0.75rem', // rounded-xl
                    padding: '0.2rem',
                    borderColor: state.isFocused ? '#6366f1' : '#e5e7eb', // indigo-500 : gray-200
                    boxShadow: state.isFocused ? '0 0 0 2px #c7d2fe' : 'none', // ring-indigo-200
                    '&:hover': { borderColor: '#a5b4fc' },
                  }),
                }}
              />
              {touchedFields.subject && !isSubjectValid && (
                <p className="mt-1 text-sm text-red-500">Please select a subject.</p>
              )}
            </div>

            {/* Description */}
            <div>
              <RequiredLabel label="Description" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleBlur('description')}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition min-h-[140px] resize-y shadow-sm ${
                  touchedFields.description && !isDescriptionValid
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                }`}
                placeholder="Describe your teaching methodology, experience, and what students can expect..."
              />
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span className={touchedFields.description && !isDescriptionValid ? "text-red-500" : ""}>
                  Minimum 20 characters
                </span>
                <span>{description.length} chars</span>
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fee Details */}
              <div className="md:col-span-2">
                <RequiredLabel label="Fee Details" />
                <textarea
                  value={feeDetails}
                  onChange={(e) => setFeeDetails(e.target.value)}
                  onBlur={() => handleBlur('feeDetails')}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition min-h-[100px] shadow-sm ${
                    touchedFields.feeDetails && !isFeeDetailsValid
                      ? 'border-red-300 focus:ring-red-200 bg-red-50'
                      : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                  placeholder="e.g., $30/hr, Package deals available..."
                />
                {touchedFields.feeDetails && !isFeeDetailsValid && (
                  <p className="mt-1 text-sm text-red-500">Please specify your fee structure.</p>
                )}
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Education (Optional)</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition shadow-sm"
                  placeholder="Degree, University..."
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Experience (Optional)</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition shadow-sm"
                  placeholder="Years of experience..."
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition shadow-sm"
                  placeholder="Contact number..."
                />
              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition min-h-[80px] shadow-sm"
                placeholder="Any welcome message for potential students..."
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="gigForm"
            disabled={isLoading || !isFormValid}
            className={`px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transform transition-all active:scale-95 ${
              isLoading
                ? 'bg-indigo-400 cursor-wait'
                : isFormValid
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Posting...' : 'Post Gig'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GigPostForm;
