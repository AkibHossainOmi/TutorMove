import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const JobPostForm = ({ onClose, onJobCreated, studentId }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    location: '',
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
    const storedUser = localStorage.getItem('user');
    let studentId = null;
    
    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        studentId = parsedUser.user_id || null;
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
    try {
      const payload = {
        student: studentId,
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        location: formData.location,
      };

      const response = await axios.post('http://localhost:8000/api/jobs/create', payload); // Adjust API URL if needed
      if (response.status === 201) {
        setSuccessMessage('Job posted successfully!');
        onJobCreated && onJobCreated(response.data);
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error("Job posting error:", error);
      setErrorMessage(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Failed to post job. Please check your inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: 12, padding: 40,
        maxWidth: 700, width: '90%', maxHeight: '90vh',
        overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 15
        }}>
          <h2 style={{ margin: 0, fontSize: '2em', fontWeight: 700 }}>Post a New Job</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: 32, cursor: 'pointer', color: '#6c757d'
          }}>×</button>
        </div>

        {successMessage && (
          <div style={{
            backgroundColor: '#d4edda', color: '#155724', padding: 15,
            borderRadius: 8, marginBottom: 20, border: '1px solid #c3e6cb'
          }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            backgroundColor: '#f8d7da', color: '#721c24', padding: 15,
            borderRadius: 8, marginBottom: 20, border: '1px solid #f5c6cb'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 25 }}>
            <label htmlFor="title" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '12px 15px',
                border: '1px solid #ced4da', borderRadius: 8
              }}
            />
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 25 }}>
            <label htmlFor="subject" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="e.g., Mathematics, English"
              style={{
                width: '100%', padding: '12px 15px',
                border: '1px solid #ced4da', borderRadius: 8
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 25 }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              style={{
                width: '100%', padding: '12px 15px',
                border: '1px solid #ced4da', borderRadius: 8
              }}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: 25 }}>
            <label htmlFor="location" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '12px 15px',
                border: '1px solid #ced4da', borderRadius: 8
              }}
              placeholder="e.g., Dhaka, Chittagong"
            />
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 15,
            marginTop: 30, borderTop: '1px solid #eee', paddingTop: 20
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 28px', borderRadius: 8,
                backgroundColor: '#6c757d', color: 'white', border: 'none'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 28px', borderRadius: 8,
                backgroundColor: isSubmitting ? '#94d3a2' : '#28a745',
                color: 'white', border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
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
