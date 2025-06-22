import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Still included if you plan to use it for translations
import { jobAPI } from '../utils/apiService'; // Ensure this service is correctly implemented
import { useNotification } from '../contexts/NotificationContext';

const JobPostForm = ({ onClose, onJobCreated }) => {
  const { t } = useTranslation();
  const { addNotification: showNotification } = useNotification(); // Destructure correctly

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
    deadline: '', // Format this as 'YYYY-MM-DD' for date input
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      // Ensure the deadline is in the correct format if your backend expects it differently
      const payload = {
        ...formData,
        // Example: If backend needs date as a Date object or specific string format
        // deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };

      const response = await jobAPI.createJob(payload);
      if (response.status === 201) {
        showNotification('Job posted successfully!', 'success');
        onJobCreated && onJobCreated(response.data);
        onClose(); // Close modal on success
      }
    } catch (error) {
      console.error("Job posting error:", error);
      showNotification(
        error.response?.data?.message || error.response?.data?.detail || 'Failed to post job. Please check your inputs.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Inline Styles ---
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000, // High z-index for modals
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px', // More rounded
    padding: '40px', // More padding
    maxWidth: '700px', // Wider modal for more content
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto', // Scrollable if content overflows
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)', // Stronger shadow
    position: 'relative', // For close button positioning
    fontFamily: '"Segoe UI", Arial, sans-serif', // Modern font
    color: '#333',
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px', // More space below header
    borderBottom: '1px solid #eee', // Subtle separator
    paddingBottom: '15px',
  };

  const modalTitleStyle = {
    margin: 0,
    color: '#2c3e50',
    fontSize: '2em', // Larger title
    fontWeight: '700',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '32px', // Larger close icon
    cursor: 'pointer',
    color: '#6c757d',
    padding: '5px', // Make it easier to click
    transition: 'color 0.2s ease',
  };

  const closeButtonHoverStyle = {
    color: '#333',
  };

  const formGroupStyle = {
    marginBottom: '25px', // Consistent spacing between form groups
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px', // More space below label
    fontWeight: '600', // Bolder labels
    color: '#495057',
    fontSize: '1em',
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '12px 15px', // More padding for inputs
    border: '1px solid #ced4da', // Lighter border color
    borderRadius: '8px', // More rounded inputs
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const inputFocusStyle = {
    borderColor: '#28a745', // Green focus for job posting
    boxShadow: '0 0 0 3px rgba(40, 167, 69, 0.2)',
  };

  const textareaStyle = {
    ...inputBaseStyle,
    resize: 'vertical', // Allow vertical resizing
    minHeight: '80px',
  };

  const selectStyle = {
    ...inputBaseStyle,
    appearance: 'none', // Remove default arrow
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 15px center',
    backgroundSize: '12px',
    cursor: 'pointer', // Indicate it's clickable
  };

  const formActionsStyle = {
    display: 'flex',
    gap: '15px', // More space between buttons
    justifyContent: 'flex-end',
    marginTop: '30px', // More space above buttons
    borderTop: '1px solid #eee', // Separator above buttons
    paddingTop: '20px',
  };

  const buttonBaseStyle = {
    padding: '12px 28px', // Generous padding
    borderRadius: '8px', // Rounded buttons
    border: 'none',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.1s ease, box-shadow 0.2s ease',
    outline: 'none',
  };

  const cancelButtonStyles = {
    ...buttonBaseStyle,
    backgroundColor: '#6c757d', // Grey for cancel
    color: 'white',
  };
  const cancelButtonHoverStyles = {
    backgroundColor: '#5a6268',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  };

  const submitButtonStyles = {
    ...buttonBaseStyle,
    backgroundColor: '#28a745', // Green for submit
    color: 'white',
  };
  const submitButtonHoverStyles = {
    backgroundColor: '#218838',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.25)',
  };
  const submitButtonDisabledStyles = {
    backgroundColor: '#94d3a2', // Lighter green when disabled
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  };

  // Helper for conditional rendering based on teaching type
  const isLocationRequired = formData.type !== 'online';

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

        <form onSubmit={handleSubmit}>
          {/* Job Title */}
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
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              Give your job post a clear and concise title.
            </small>
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
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              Choose the primary subject for this job.
            </small>
          </div>

          {/* Level & Type (flex row) */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
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
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Specify the academic level required.
              </small>
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
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                How would you like the tutoring to take place?
              </small>
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
              rows="5" // Increased rows for more content
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, textareaStyle)}
              placeholder="Describe what you need help with, your goals, and any specifics about the job (e.g., frequency, duration of sessions)."
            />
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              Provide a detailed description of the job.
            </small>
          </div>

          {/* Budget & Duration (flex row) */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
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
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Your proposed budget for the entire job in credits.
              </small>
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
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Approximate timeframe for the job.
              </small>
            </div>
          </div>

          {/* Location (conditional rendering based on type) */}
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
                required={isLocationRequired} // Make required if applicable
                style={inputBaseStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
                placeholder="e.g., Tongi, Dhaka Division, Bangladesh"
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Specify the location for home tutoring.
              </small>
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
              rows="3"
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, textareaStyle)}
              placeholder="Any specific qualifications, tools, or experience you expect from the tutor."
            />
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              List any specific requirements for the tutor.
            </small>
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
              min={new Date().toISOString().split('T')[0]} // Set min date to today
            />
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              When do you need applications by? (Optional)
            </small>
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