import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { tutorAPI } from '../utils/apiService'; // Ensure this service is correctly implemented
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

const GigPostForm = ({ onClose, onGigCreated }) => {
  const { t } = useTranslation();
  const { addNotification: showNotification } = useNotification(); // Destructure correctly

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_ids: [],
    hourlyRate: '',
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    },
    teachingType: [],
    levels: [],
    location: '', // Only relevant if teachingType includes 'home' or 'both'
    qualifications: '',
    experience: ''
  });

  const [subjectQuery, setSubjectQuery] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]); // To display names of selected subjects
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectSearchLoading, setSubjectSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // Controls subject suggestion dropdown visibility
  const dropdownRef = useRef(); // Ref for click-outside to close dropdown

  // Fetch subject suggestions as user types
  useEffect(() => {
    if (subjectQuery.length < 2) { // Start search after 2 characters
      setSubjectOptions([]);
      setSubjectSearchLoading(false);
      return;
    }
    setSubjectSearchLoading(true);
    const debounceTimer = setTimeout(() => {
      axios
        .get(`/api/subjects/suggest/?q=${encodeURIComponent(subjectQuery)}`)
        .then((res) => {
          // Filter out subjects already selected
          const filteredOptions = res.data.filter(
            (option) => !formData.subject_ids.includes(option.id)
          );
          setSubjectOptions(filteredOptions);
          setShowDropdown(true); // Show dropdown if there are results
        })
        .catch((err) => {
          console.error("Subject search error:", err);
          setSubjectOptions([]);
          showNotification('Failed to fetch subjects. Please try again.', 'error');
        })
        .finally(() => setSubjectSearchLoading(false));
    }, 300); // Debounce for 300ms
    return () => clearTimeout(debounceTimer);
  }, [subjectQuery, formData.subject_ids, showNotification]);

  // Update selectedSubjects state with actual names when subject_ids change
  useEffect(() => {
    if (formData.subject_ids.length === 0) {
      setSelectedSubjects([]);
      return;
    }
    // Fetch full subject objects for display (e.g., to get names from IDs)
    axios
      .get('/api/subjects/') // Assuming this returns all subjects or can filter by IDs
      .then((res) => {
        const allSubjectsMap = {};
        res.data.forEach((subj) => {
          allSubjectsMap[subj.id] = subj;
        });
        const currentSelected = formData.subject_ids.map((id) => allSubjectsMap[id]).filter(Boolean);
        setSelectedSubjects(currentSelected);
      })
      .catch((err) => {
        console.error("Error fetching selected subjects' names:", err);
        setSelectedSubjects([]); // Clear on error
      });
  }, [formData.subject_ids]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Handlers for form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLevelsChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, levels: value }));
  };

  const handleTeachingTypeChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, teachingType: value }));
  };

  const handleAvailabilityChange = (day, timeSlot) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].includes(timeSlot)
          ? prev.availability[day].filter((slot) => slot !== timeSlot)
          : [...prev.availability[day], timeSlot]
      }
    }));
  };

  // Subject management handlers
  const handleSubjectInput = (e) => {
    setSubjectQuery(e.target.value);
    // showDropdown will be set by useEffect after debounce
  };

  const handleAddSubject = (subjectObj) => {
    if (!formData.subject_ids.includes(subjectObj.id)) {
      setFormData((prev) => ({
        ...prev,
        subject_ids: [...prev.subject_ids, subjectObj.id]
      }));
    }
    setSubjectQuery(''); // Clear query after adding
    setSubjectOptions([]); // Clear options
    setShowDropdown(false); // Hide dropdown
  };

  const handleRemoveSubject = (id) => {
    setFormData((prev) => ({
      ...prev,
      subject_ids: prev.subject_ids.filter((sid) => sid !== id)
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        // Ensure availability is sent in a format your backend expects,
        // e.g., converting array of slots to a string or specific structure.
        // For now, sending as is, assuming backend handles it.
        // If your backend needs, say, 'ONLINE' instead of ['online'], adjust here.
        // Example: teaching_type: formData.teachingType.join(','),
      };

      const response = await tutorAPI.createGig(payload);
      if (response.status === 201) {
        showNotification('Gig posted successfully!', 'success');
        onGigCreated && onGigCreated(response.data);
        onClose(); // Close modal on success
      }
    } catch (error) {
      console.error("Gig creation error:", error);
      showNotification(
        error.response?.data?.message || error.response?.data?.detail || 'Failed to post gig. Please check your inputs.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    'Morning (8AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)', 'Night (8PM-12AM)'
  ];

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
    zIndex: 10000, // Higher z-index for modals
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px', // More rounded
    padding: '40px', // More padding
    maxWidth: '850px', // Wider modal for more content
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)', // Stronger shadow
    position: 'relative', // For close button positioning
    fontFamily: '"Segoe UI", Arial, sans-serif',
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
    borderColor: '#007bff',
    boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.2)',
  };

  const selectBaseStyle = {
    ...inputBaseStyle,
    height: '120px', // Taller select for multiple options
    appearance: 'none', // Remove default dropdown arrow for custom styling if needed
    // You might add a custom arrow via background-image here if needed
  };

  const textareaStyle = {
    ...inputBaseStyle,
    resize: 'vertical', // Allow vertical resizing
    minHeight: '80px',
  };

  const selectedSubjectBadgeContainerStyle = {
    marginTop: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px', // Spacing between badges
  };

  const selectedSubjectBadgeStyle = {
    display: 'inline-flex', // Align text and close icon
    alignItems: 'center',
    background: '#e9f5ff', // Light blue background
    color: '#007bff', // Blue text
    borderRadius: '20px', // Pill shape
    padding: '6px 12px',
    fontSize: '0.9em',
    fontWeight: '500',
    border: '1px solid #cce5ff', // Subtle border
  };

  const removeSubjectButtonStyle = {
    marginLeft: '8px',
    cursor: 'pointer',
    color: '#dc3545', // Red close icon
    fontWeight: 'bold',
    fontSize: '1.1em', // Slightly larger X
    lineHeight: 1, // Align vertically
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
  };

  const formSectionHeaderStyle = {
    margin: '0 0 15px',
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#34495e',
  };

  const availabilityGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', // Adjust for more columns
    gap: '20px', // Spacing between day columns
  };

  const dayColumnStyle = {
    backgroundColor: '#f9f9f9', // Light background for each day
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  };

  const dayTitleStyle = {
    margin: '0 0 12px',
    textTransform: 'capitalize',
    fontSize: '1.1em',
    color: '#343a40',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px',
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Space between checkbox and text
    marginBottom: '8px',
    fontSize: '0.95em',
    color: '#555',
    cursor: 'pointer',
  };

  const checkboxInputStyle = {
    accentColor: '#007bff', // Custom checkbox color
    width: '18px',
    height: '18px',
  };

  const formActionsStyle = {
    display: 'flex',
    gap: '15px', // More space between buttons
    justifyContent: 'flex-end',
    marginTop: '30px', // More space above buttons
    borderTop: '1px solid #eee',
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
    backgroundColor: '#007bff',
    color: 'white',
  };
  const submitButtonHoverStyles = {
    backgroundColor: '#0056b3',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(0,123,255,0.25)',
  };
  const submitButtonDisabledStyles = {
    backgroundColor: '#a0d1ff', // Lighter blue when disabled
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Create a Teaching Gig</h2>
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
          {/* Title */}
          <div style={formGroupStyle}>
            <label htmlFor="title" style={labelStyle}>
              Gig Title <span style={{ color: '#dc3545' }}>*</span>
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
              placeholder="e.g., Experienced Math Tutor for All Levels"
            />
          </div>

          {/* Subject AutoSuggest */}
          <div style={{ ...formGroupStyle, position: 'relative' }} ref={dropdownRef}>
            <label htmlFor="subject-input" style={labelStyle}>
              Subjects (type to search & select multiple) <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              id="subject-input"
              value={subjectQuery}
              onChange={handleSubjectInput}
              onFocus={() => subjectQuery.length >= 2 && setShowDropdown(true)} // Only show on focus if query is long enough
              placeholder="Start typing a subject (e.g., Physics, History)..."
              style={inputBaseStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)} // Maintain focus style on mouse hover
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
            />
            {showDropdown && (subjectQuery.length >= 2 || subjectOptions.length > 0) && ( // Show if query is typed or options exist
              <div style={{
                position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
                background: '#fff', border: '1px solid #dee2e6',
                borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10001, // Higher z-index
                maxHeight: '200px', overflowY: 'auto'
              }}>
                {subjectSearchLoading ? (
                  <div style={{ padding: '12px', color: '#888', textAlign: 'center' }}>Loading subjects...</div>
                ) : subjectOptions.length === 0 ? (
                  <div style={{ padding: '12px', color: '#888', textAlign: 'center' }}>No subjects found. Try a different search.</div>
                ) : (
                  subjectOptions.map((subj) => (
                    <div
                      key={subj.id}
                      style={{
                        padding: '10px 15px', cursor: 'pointer',
                        borderBottom: '1px solid #f2f2f2',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      onClick={() => handleAddSubject(subj)}
                    >
                      {subj.name}
                      {subj.aliases && (
                        <span style={{ color: '#888', fontSize: '0.85em', marginLeft: '5px' }}> ({subj.aliases})</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Selected Subjects Badges */}
            <div style={selectedSubjectBadgeContainerStyle}>
              {selectedSubjects.map((subj) =>
                <span key={subj.id} style={selectedSubjectBadgeStyle}>
                  {subj.name}
                  <button
                    type="button" // Important for buttons inside forms not to submit
                    style={removeSubjectButtonStyle}
                    onClick={() => handleRemoveSubject(subj.id)}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              Select all relevant subjects for your gig.
            </small>
          </div>

          {/* Teaching Type & Levels */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 'calc(50% - 10px)' }}>
              <label htmlFor="teachingType" style={labelStyle}>
                Teaching Type <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <select
                multiple
                id="teachingType"
                name="teachingType"
                value={formData.teachingType}
                onChange={handleTeachingTypeChange}
                required
                style={selectBaseStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, selectBaseStyle)}
              >
                <option value="online">Online Teaching</option>
                <option value="home">Home Tutoring</option>
                <option value="both">Both (Online & Home)</option>
              </select>
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Hold Ctrl/Cmd to select multiple.
              </small>
            </div>
            <div style={{ flex: 1, minWidth: 'calc(50% - 10px)' }}>
              <label htmlFor="levels" style={labelStyle}>
                Levels <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <select
                multiple
                id="levels"
                name="levels"
                value={formData.levels}
                onChange={handleLevelsChange}
                required
                style={selectBaseStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, selectBaseStyle)}
              >
                <option value="elementary">Elementary</option>
                <option value="middle-school">Middle School</option>
                <option value="high-school">High School</option>
                <option value="college">College</option>
                <option value="university">University</option>
                <option value="adult-learner">Adult Learner</option> {/* Added for completeness */}
              </select>
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Hold Ctrl/Cmd to select multiple.
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
              placeholder="Describe your teaching style, methods, qualifications, and what students can expect from your gig. Be detailed!"
            />
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              Provide a comprehensive description of your gig.
            </small>
          </div>

          {/* Hourly Rate */}
          <div style={formGroupStyle}>
            <label htmlFor="hourlyRate" style={labelStyle}>
              Hourly Rate (Credits) <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              required
              min="1"
              style={inputBaseStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
              placeholder="e.g., 50 (credits per hour)"
            />
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              Set your price in credits per hour.
            </small>
          </div>

          {/* Availability */}
          <div style={formGroupStyle}>
            <h3 style={formSectionHeaderStyle}>Availability</h3>
            <div style={availabilityGridStyle}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} style={dayColumnStyle}>
                  <h4 style={dayTitleStyle}>{day}</h4>
                  {timeSlots.map((slot) => (
                    <div key={slot} style={{ marginBottom: '8px' }}>
                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          checked={formData.availability[day].includes(slot)}
                          onChange={() => handleAvailabilityChange(day, slot)}
                          style={checkboxInputStyle}
                        />
                        {slot}
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <small style={{ color: '#6c757d', display: 'block', marginTop: '10px' }}>
              Select the time slots when you are generally available to teach.
            </small>
          </div>

          {/* Location (conditional render) */}
          {(formData.teachingType.includes('home') || formData.teachingType.includes('both')) && (
            <div style={formGroupStyle}>
              <label htmlFor="location" style={labelStyle}>
                Location (for home tutoring)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={inputBaseStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
                placeholder="e.g., Dhaka, Gulshan-1"
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Specify your preferred area for in-person tutoring.
              </small>
            </div>
          )}

          {/* Qualifications */}
          <div style={formGroupStyle}>
            <label htmlFor="qualifications" style={labelStyle}>
              Qualifications
            </label>
            <textarea
              id="qualifications"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              rows="3"
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, textareaStyle)}
              placeholder="List your relevant qualifications, certifications, and degrees (e.g., Bachelor of Science in Physics, TEFL Certificate)..."
            />
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              Highlight your academic and professional achievements.
            </small>
          </div>

          {/* Experience */}
          <div style={formGroupStyle}>
            <label htmlFor="experience" style={labelStyle}>
              Teaching Experience
            </label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="3"
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, textareaStyle)}
              placeholder="Describe your teaching experience (e.g., 5 years teaching high school math, private tutor since 2020)..."
            />
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              Detail your relevant teaching history and expertise.
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
              {isSubmitting ? 'Creating Gig...' : 'Create Gig'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GigPostForm;