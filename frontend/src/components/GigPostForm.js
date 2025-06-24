// ../components/GigPostForm.js
import React, { useState } from 'react';
import axios from 'axios';

const GigPostForm = ({ onClose, onGigCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Mock API endpoint for creating a gig. Replace with your actual Django endpoint.
    // Ensure this matches your backend where gig posts are handled.
    const GIG_CREATION_ENDPOINT = 'YOUR_DJANGO_BACKEND_URL/api/tutor/gigs/'; // <-- IMPORTANT: Update this URL!

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        // Basic validation
        if (!title || !description || !subject) {
            setError('Please fill in all required fields.');
            setIsLoading(false);
            return;
        }

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const teacherId = storedUser?.user_id; // Get dynamic user ID

            if (!teacherId) {
                setError('User not logged in or user ID not found. Please log in again.');
                setIsLoading(false);
                return;
            }

            const newGigData = {
                title,
                description,
                subject,
                teacher_id: teacherId, // Associate gig with the teacher
                status: 'active' // Default status for a new gig
                // Removed 'rate' field as requested
            };

            // --- REAL API CALL (UNCOMMENT AND CONFIGURE FOR PRODUCTION) ---
            // const response = await axios.post(GIG_CREATION_ENDPOINT, newGigData, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         // If you use token-based authentication (e.g., Django Rest Framework Token):
            //         // 'Authorization': `Token ${storedUser.token}`, // Assuming token is stored in user object
            //     },
            // });
            // const createdGig = response.data; // Assuming your API returns the created gig object

            // --- MOCK API CALL (FOR DEMONSTRATION) ---
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
            const createdGig = {
                id: `mock-gig-${Date.now()}`, // Mock ID
                ...newGigData,
                created_at: new Date().toISOString()
            };
            // --- END MOCK API CALL ---

            setSuccess('Gig created successfully!');
            onGigCreated(createdGig); // Pass the new gig back to the dashboard
            // Optionally, clear form or close after success
            setTimeout(() => {
                onClose();
            }, 1000); // Close after a short delay to show success message

        } catch (err) {
            console.error('Error creating gig:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.detail || 'Failed to create gig. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                <h2 style={formTitleStyle}>Post a New Gig</h2>
                <p style={formSubtitleStyle}>Showcase your expertise and connect with students.</p>

                <form onSubmit={handleSubmit}>
                    <div style={formGroupStyle}>
                        <label htmlFor="gigTitle" style={labelStyle}>Gig Title <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            id="gigTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inputStyle}
                            placeholder="e.g., Advanced Calculus Tutor, Conversational English"
                            required
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="gigDescription" style={labelStyle}>Description <span style={{ color: 'red' }}>*</span></label>
                        <textarea
                            id="gigDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                            placeholder="Describe your teaching style, experience, and what students will learn."
                            required
                        ></textarea>
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="gigSubject" style={labelStyle}>Subject <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            id="gigSubject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            style={inputStyle}
                            placeholder="e.g., Mathematics, English, Physics, Programming"
                            required
                        />
                    </div>

                    {isLoading && (
                        <div style={messageStyle}>
                            <div className="loading-spinner" style={spinnerStyle}></div>
                            <span>Creating gig...</span>
                        </div>
                    )}
                    {error && <p style={errorStyle}>{error}</p>}
                    {success && <p style={successStyle}>{success}</p>}

                    <div style={buttonGroupStyle}>
                        <button type="submit" style={submitButtonStyle} disabled={isLoading}>
                            Post Gig
                        </button>
                        <button type="button" onClick={onClose} style={cancelButtonStyle} disabled={isLoading}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            {/* Simple global style for fade-in effect on modal */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .loading-spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    margin-right: 10px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

// --- Updated and professionalized inline styles for the form ---
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)' // Subtle blur for background
};

const modalContentStyle = {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', // More pronounced shadow
    width: '90%',
    maxWidth: '550px', // Slightly wider
    position: 'relative',
    animation: 'fadeIn 0.3s ease-out',
    borderTop: '5px solid #007bff' // Accent border
};

const closeButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px 10px',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    outline: 'none'
};
closeButtonStyle[':hover'] = {
    backgroundColor: '#f0f0f0',
    color: '#333'
}; // Pseudoclass for hover

const formTitleStyle = {
    marginBottom: '10px',
    color: '#2c3e50',
    fontSize: '2em',
    fontWeight: '700',
    textAlign: 'center'
};

const formSubtitleStyle = {
    marginBottom: '30px',
    color: '#7f8c8d',
    fontSize: '1em',
    textAlign: 'center'
};

const formGroupStyle = {
    marginBottom: '25px' // Increased spacing
};

const labelStyle = {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '600',
    color: '#34495e',
    fontSize: '0.95em'
};

const inputStyle = {
    width: '100%',
    padding: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1em',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
};
inputStyle[':focus'] = {
    borderColor: '#007bff',
    boxShadow: '0 0 0 3px rgba(0,123,255,0.25)',
    outline: 'none'
}; // Pseudoclass for focus

const buttonGroupStyle = {
    display: 'flex',
    justifyContent: 'center', // Center buttons
    gap: '15px', // Increased gap
    marginTop: '30px'
};

const submitButtonStyle = {
    padding: '14px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.05em',
    fontWeight: '600',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(0,123,255,0.2)'
};
submitButtonStyle[':hover'] = {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)'
};
submitButtonStyle[':disabled'] = {
    backgroundColor: '#a0c8f5',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
};

const cancelButtonStyle = {
    padding: '14px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.05em',
    fontWeight: '600',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(108,117,125,0.2)'
};
cancelButtonStyle[':hover'] = {
    backgroundColor: '#5a6268',
    transform: 'translateY(-2px)'
};
cancelButtonStyle[':disabled'] = {
    backgroundColor: '#c0c8cf',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
};

const messageStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.95em',
    backgroundColor: '#e9f7ef',
    color: '#28a745',
    border: '1px solid #d4edda'
};

const errorStyle = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #f5c6cb'
};

const successStyle = {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #c3e6cb'
};

const spinnerStyle = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff', // Spinner color matches primary button
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'spin 1s linear infinite',
    marginRight: '10px'
};

export default GigPostForm;