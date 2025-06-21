import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { tutorAPI } from '../utils/apiService';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

const GigPostForm = ({ onClose, onGigCreated }) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
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
    location: '',
    qualifications: '',
    experience: ''
  });
  const [subjectQuery, setSubjectQuery] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectSearchLoading, setSubjectSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Fetch subject suggestions as user types
  useEffect(() => {
    if (!subjectQuery) {
      setSubjectOptions([]);
      return;
    }
    setSubjectSearchLoading(true);
    const debounce = setTimeout(() => {
      axios
        .get(`/api/subjects/suggest/?q=${encodeURIComponent(subjectQuery)}`)
        .then((res) => setSubjectOptions(res.data))
        .catch(() => setSubjectOptions([]))
        .finally(() => setSubjectSearchLoading(false));
    }, 300);
    return () => clearTimeout(debounce);
  }, [subjectQuery]);

  // Fetch badge names for selected subjects (only on mount or change)
  useEffect(() => {
    if (formData.subject_ids.length === 0) {
      setSelectedSubjects([]);
      return;
    }
    axios
      .get('/api/subjects/')
      .then((res) => {
        const map = {};
        res.data.forEach((subj) => {
          map[subj.id] = subj;
        });
        setSelectedSubjects(formData.subject_ids.map((id) => map[id] || { id, name: `Subject ${id}` }));
      })
      .catch(() => setSelectedSubjects([]));
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

  // Handler for subject text input
  const handleSubjectInput = (e) => {
    setSubjectQuery(e.target.value);
    setShowDropdown(true);
  };

  // Add selected subject
  const handleAddSubject = (subjectObj) => {
    if (!formData.subject_ids.includes(subjectObj.id)) {
      setFormData((prev) => ({
        ...prev,
        subject_ids: [...prev.subject_ids, subjectObj.id]
      }));
    }
    setSubjectQuery('');
    setSubjectOptions([]);
    setShowDropdown(false);
  };

  // Remove selected subject
  const handleRemoveSubject = (id) => {
    setFormData((prev) => ({
      ...prev,
      subject_ids: prev.subject_ids.filter((sid) => sid !== id)
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        levels: formData.levels,
        teachingType: formData.teachingType
      };
      const response = await tutorAPI.createGig(payload);
      if (response.status === 201) {
        showNotification('Gig posted successfully!', 'success');
        onGigCreated && onGigCreated(response.data);
        onClose();
      }
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to post gig',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    'Morning (8AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)', 'Night (8PM-12AM)'
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', padding: '30px',
        maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#212529' }}>Create a Teaching Gig</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6c757d'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Gig Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '10px', border: '1px solid #dee2e6',
                borderRadius: '4px', fontSize: '16px'
              }}
              placeholder="e.g., Experienced Math Tutor for All Levels"
            />
          </div>

          {/* Subject AutoSuggest */}
          <div style={{ marginBottom: '20px', position: 'relative' }} ref={dropdownRef}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Subjects (auto-suggest, select multiple) *
            </label>
            <input
              type="text"
              value={subjectQuery}
              onChange={handleSubjectInput}
              onFocus={() => setShowDropdown(true)}
              placeholder="Type to search subjects..."
              style={{
                width: '100%', padding: '10px', border: '1px solid #dee2e6',
                borderRadius: '4px', fontSize: '16px'
              }}
              autoComplete="off"
            />
            {showDropdown && subjectQuery && (
              <div style={{
                position: 'absolute', background: '#fff', border: '1px solid #dee2e6',
                borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', zIndex: 999, width: '100%'
              }}>
                {subjectSearchLoading ? (
                  <div style={{ padding: 12, color: '#888' }}>Loading...</div>
                ) : subjectOptions.length === 0 ? (
                  <div style={{ padding: 12, color: '#888' }}>No subjects found.</div>
                ) : (
                  subjectOptions.map((subj) => (
                    <div
                      key={subj.id}
                      style={{
                        padding: '8px 12px', cursor: 'pointer',
                        borderBottom: '1px solid #f2f2f2'
                      }}
                      onClick={() => handleAddSubject(subj)}
                    >
                      {subj.name}
                      {subj.aliases && (
                        <span style={{ color: '#888', fontSize: 13 }}> ({subj.aliases})</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Selected Subjects Badges */}
            <div style={{ marginTop: 8 }}>
              {selectedSubjects.map((subj) =>
                <span key={subj.id} style={{
                  display: 'inline-block', background: '#e9ecef', color: '#007bff',
                  borderRadius: 12, padding: '3px 10px', fontSize: 13, marginRight: 6, marginBottom: 2
                }}>
                  {subj.name}
                  <span style={{
                    marginLeft: 5, cursor: 'pointer', color: '#dc3545', fontWeight: 'bold'
                  }}
                    onClick={() => handleRemoveSubject(subj.id)}>×</span>
                </span>
              )}
            </div>
            <small style={{ color: '#6c757d' }}>Type and select from suggestions.</small>
          </div>

          {/* Teaching Type & Levels */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Teaching Type *
              </label>
              <select
                multiple name="teachingType" value={formData.teachingType}
                onChange={handleTeachingTypeChange} required
                style={{ width: '100%', padding: '10px', border: '1px solid #dee2e6', borderRadius: '4px', fontSize: '16px', height: '100px' }}>
                <option value="online">Online Teaching</option>
                <option value="home">Home Tutoring</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Levels *
              </label>
              <select
                multiple name="levels" value={formData.levels}
                onChange={handleLevelsChange} required
                style={{ width: '100%', padding: '10px', border: '1px solid #dee2e6', borderRadius: '4px', fontSize: '16px', height: '100px' }}>
                <option value="elementary">Elementary</option>
                <option value="middle-school">Middle School</option>
                <option value="high-school">High School</option>
                <option value="college">College</option>
                <option value="university">University</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical'
              }}
              placeholder="Describe your teaching style, methods, and what students can expect..."
            />
          </div>

          {/* Hourly Rate */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Hourly Rate (Credits) *
            </label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              required
              min="1"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="50"
            />
          </div>

          {/* Availability */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Availability
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {Object.keys(formData.availability).map((day) => (
                <div key={day}>
                  <h4 style={{ margin: '0 0 10px', textTransform: 'capitalize' }}>{day}</h4>
                  {timeSlots.map((slot) => (
                    <div key={slot} style={{ marginBottom: '5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                          type="checkbox"
                          checked={formData.availability[day].includes(slot)}
                          onChange={() => handleAvailabilityChange(day, slot)}
                        />
                        {slot}
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {(formData.teachingType.includes('home') || formData.teachingType.includes('both')) && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="City, State"
              />
            </div>
          )}

          {/* Qualifications */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Qualifications
            </label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical'
              }}
              placeholder="List your relevant qualifications, certifications, and degrees..."
            />
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Teaching Experience
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical'
              }}
              placeholder="Describe your teaching experience..."
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Gig'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GigPostForm;
