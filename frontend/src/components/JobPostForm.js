import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jobAPI } from '../utils/apiService';

const JobPostForm = ({ onClose, onJobCreated }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    level: '',
    budget: '',
    duration: '',
    location: '',
    type: 'online', // online, home, both
    requirements: '',
    deadline: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await jobAPI.createJob(formData);
      if (response.status === 201) {
        setSuccessMessage('Job posted successfully!');
        onJobCreated && onJobCreated(response.data);

        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Job posting error:", error);
      setErrorMessage(
        error.response?.data?.message || error.response?.data?.detail || 'Failed to post job. Please check your inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocationRequired = formData.type !== 'online';

  // --- Styles ---

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    maxWidth: 700,
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    position: 'relative',
    fontFamily: '"Segoe UI", Arial, sans-serif',
    color: '#333',
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '1px solid #eee',
    paddingBottom: 15,
  };

  const modalTitleStyle = {
    margin: 0,
    color: '#2c3e50',
    fontSize: '2em',
    fontWeight: 700,
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: 32,
    cursor: 'pointer',
    color: '#6c757d',
    padding: 5,
    transition: 'color 0.2s ease',
  };

  const closeButtonHoverStyle = {
    color: '#333',
  };

  const formGroupStyle = {
    marginBottom: 25,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    fontWeight: 600,
    color: '#495057',
    fontSize: '1em',
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ced4da',
    borderRadius: 8,
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const inputFocusStyle = {
    borderColor: '#28a745',
    boxShadow: '0 0 0 3px rgba(40, 167, 69, 0.2)',
  };

  const textareaStyle = {
    ...inputBaseStyle,
    resize: 'vertical',
    minHeight: 80,
  };

  const selectStyle = {
    ...inputBaseStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 15px center',
    backgroundSize: 12,
    cursor: 'pointer',
  };

  const formActionsStyle = {
    display: 'flex',
    gap: 15,
    justifyContent: 'flex-end',
    marginTop: 30,
    borderTop: '1px solid #eee',
    paddingTop: 20,
  };

  const buttonBaseStyle = {
    padding: '12px 28px',
    borderRadius: 8,
    border: 'none',
    fontSize: '1em',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.1s ease, box-shadow 0.2s ease',
    outline: 'none',
  };

  const cancelButtonStyles = {
    ...buttonBaseStyle,
    backgroundColor: '#6c757d',
    color: 'white',
  };
  const cancelButtonHoverStyles = {
    backgroundColor: '#5a6268',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  };

  const submitButtonStyles = {
    ...buttonBaseStyle,
    backgroundColor: '#28a745',
    color: 'white',
  };
  const submitButtonHoverStyles = {
    backgroundColor: '#218838',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.25)',
  };
  const submitButtonDisabledStyles = {
    backgroundColor: '#94d3a2',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Post a New Job</h2>
          <button
            onClick={onClose}
            style={closeButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, closeButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, closeButtonStyle)}
          >
            ×
          </button>
        </div>

        {/* Success / Error messages */}
        {successMessage && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
            border: '1px solid #c3e6cb',
          }}>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
            border: '1px solid #f5c6cb',
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={formGroupStyle}>
            <label htmlFor="title" style={labelStyle}>
              Job Title <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={inputBaseStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
              placeholder="e.g., Math Tutor for High School Student"
            />
          </div>

          {/* Subject */}
          <div style={formGroupStyle}>
            <label htmlFor="subject" style={labelStyle}>
              Subject <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              style={selectStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, selectStyle)}
            >
              <option value="">Select Subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="english">English</option>
              <option value="history">History</option>
              <option value="computer-science">Computer Science</option>
              <option value="economics">Economics</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Level & Type */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 25, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 'calc(50% - 10px)' }}>
              <label htmlFor="level" style={labelStyle}>
                Level <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                style={selectStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, selectStyle)}
              >
                <option value="">Select Level</option>
                <option value="elementary">Elementary</option>
                <option value="middle-school">Middle School</option>
                <option value="high-school">High School</option>
                <option value="college">College</option>
                <option value="university">University</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: 'calc(50% - 10px)' }}>
              <label htmlFor="type" style={labelStyle}>
                Teaching Type <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                style={selectStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, selectStyle)}
              >
                <option value="online">Online</option>
                <option value="home">Home Tutoring</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={formGroupStyle}>
            <label htmlFor="description" style={labelStyle}>
              Description <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, textareaStyle)}
              placeholder="Describe what you need help with, your goals, and any specifics about the job (e.g., frequency, duration of sessions)."
            />
          </div>

          {/* Budget & Duration */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 25, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 'calc(50% - 10px)' }}>
              <label htmlFor="budget" style={labelStyle}>
                Budget (Credits) <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min="1"
                style={inputBaseStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
                placeholder="e.g., 100 (total credits for the job)"
              />
            </div>

            <div style={{ flex: 1, minWidth: 'calc(50% - 10px)' }}>
              <label htmlFor="duration" style={labelStyle}>
                Estimated Duration
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                style={inputBaseStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
                placeholder="e.g., 2 weeks, 1 month, 10 sessions"
              />
            </div>
          </div>

          {/* Location - conditional */}
          {isLocationRequired && (
            <div style={formGroupStyle}>
              <label htmlFor="location" style={labelStyle}>
                Location <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required={isLocationRequired}
                style={inputBaseStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
                placeholder="e.g., Tongi, Dhaka Division, Bangladesh"
              />
            </div>
          )}

          {/* Requirements */}
          <div style={formGroupStyle}>
            <label htmlFor="requirements" style={labelStyle}>
              Requirements
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={3}
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, textareaStyle)}
              placeholder="Any specific qualifications, tools, or experience you expect from the tutor."
            />
          </div>

          {/* Deadline */}
          <div style={formGroupStyle}>
            <label htmlFor="deadline" style={labelStyle}>
              Application Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              style={inputBaseStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Buttons */}
          <div style={formActionsStyle}>
            <button
              type="button"
              onClick={onClose}
              style={cancelButtonStyles}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, cancelButtonHoverStyles)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, cancelButtonStyles)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={isSubmitting ? { ...submitButtonStyles, ...submitButtonDisabledStyles } : submitButtonStyles}
              onMouseEnter={(e) => !isSubmitting && Object.assign(e.currentTarget.style, submitButtonHoverStyles)}
              onMouseLeave={(e) => !isSubmitting && Object.assign(e.currentTarget.style, submitButtonStyles)}
            >
              {isSubmitting ? 'Posting Job...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostForm;
