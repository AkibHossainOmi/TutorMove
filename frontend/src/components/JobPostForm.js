import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

const JobPostForm = ({ onClose, onJobCreated }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    location: "",
  });

  const [subjects, setSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [touchedFields, setTouchedFields] = useState({
    title: false,
    subject: false,
    description: false,
    location: false,
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/subjects/`);
        setSubjects(response.data);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    let studentId = null;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        studentId = parsedUser.user_id || null;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }

    try {
      const payload = {
        student: studentId,
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        location: formData.location,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/jobs/create`,
        payload
      );
      if (response.status === 201) {
        setSuccessMessage("Job posted successfully!");
        onJobCreated && onJobCreated(response.data);
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error("Job posting error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to post job. Please check your inputs."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field validation
  const isTitleValid = formData.title.trim().length > 0;
  const isSubjectValid = formData.subject.length > 0;
  const isDescriptionValid = formData.description.trim().length > 20;
  const isLocationValid = formData.location.trim().length > 0;

  const isFormValid =
    isTitleValid && isSubjectValid && isDescriptionValid && isLocationValid;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="jobPostFormTitle"
    >
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl relative text-gray-800 animate-fade-in">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2
              id="jobPostFormTitle"
              className="text-2xl font-bold text-gray-900 tracking-tight"
            >
              {t('Post Tutoring Job')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill out the form to post your tutoring job
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close form"
            className="text-gray-400 hover:text-gray-900 text-2xl leading-none transition-colors duration-200 rounded-full p-1 hover:bg-gray-100"
          >
            &times;
          </button>
        </header>

        {successMessage && (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 border border-green-200 font-medium text-sm flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 border border-red-200 font-medium text-sm flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block mb-2 font-medium text-gray-700 select-none text-sm"
            >
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="e.g., Math Tutor Needed for Algebra"
              className={`w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 transition ${
                touchedFields.title && !isTitleValid
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            {touchedFields.title && !isTitleValid && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a job title
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label
              htmlFor="subject"
              className="block mb-2 font-medium text-gray-700 select-none text-sm"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`w-full px-4 py-2.5 border rounded-lg text-base bg-white focus:outline-none focus:ring-2 transition ${
                touchedFields.subject && !isSubjectValid
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
            >
              <option value="" disabled>
                Select a subject
              </option>
              {subjects.map((subject) => (
                <option key={subject.id || subject.name} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
            {touchedFields.subject && !isSubjectValid && (
              <p className="mt-1 text-sm text-red-600">
                Please select a subject
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block mb-2 font-medium text-gray-700 select-none text-sm"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              rows={5}
              placeholder="Provide details about the job requirements, schedule, and any other relevant information..."
              className={`w-full px-4 py-2.5 border rounded-lg text-base resize-y focus:outline-none focus:ring-2 transition ${
                touchedFields.description && !isDescriptionValid
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            <div className="flex justify-between mt-1">
              {touchedFields.description && !isDescriptionValid ? (
                <p className="text-sm text-red-600">
                  Description should be at least 20 characters
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Minimum 20 characters
                </p>
              )}
              <p className="text-xs text-gray-500">
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label
              htmlFor="location"
              className="block mb-2 font-medium text-gray-700 select-none text-sm"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="e.g., Dhaka, Chittagong or Remote"
              className={`w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 transition ${
                touchedFields.location && !isLocationValid
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            {touchedFields.location && !isLocationValid && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a location
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`px-6 py-2.5 rounded-lg text-white font-medium text-sm transition
                ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : isFormValid
                    ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                    : "bg-blue-300 cursor-not-allowed"
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                "Post Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostForm;