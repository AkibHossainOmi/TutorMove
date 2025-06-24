import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs/');
        setJobs(response.data);
      } catch (err) {
        setError('Failed to fetch jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Inline Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#f8f8f8', // Light background for the page
    minHeight: '100vh',
    fontFamily: '"Macan", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', // Fiverr-like font stack
  };

  const headerStyle = {
    color: '#404145',
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '40px',
    textAlign: 'center',
  };

  const jobGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Responsive grid for cards
    gap: '25px',
    width: '100%',
    maxWidth: '1200px', // Max width for the grid container
    justifyContent: 'center',
  };

  const jobCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    cursor: 'pointer',
    border: '1px solid #e5e5e5',
  };

  const jobCardHoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.12)',
  };

  const cardContentStyle = {
    padding: '20px',
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const jobTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#222325',
    marginBottom: '10px',
    lineHeight: '1.4em',
    maxHeight: '2.8em', // Limit to 2 lines
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
  };

  const jobDetailStyle = {
    fontSize: '14px',
    color: '#7a7d85',
    marginBottom: '5px',
  };

  const linkStyle = {
    textDecoration: 'none',
  };

  const messageStyle = {
    color: '#62646a',
    fontSize: '18px',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
    maxWidth: '600px',
    width: '100%',
  };

  const errorStyle = {
    color: '#d62020',
    backgroundColor: '#ffe6e6',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    fontSize: '16px',
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
  };

  // Render logic based on loading, error, and jobs data
  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={messageStyle}>Loading available jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <p style={errorStyle}>{error}</p>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div style={{ height: '200px' }}></div>
    <div style={containerStyle}>
      <h2 style={headerStyle}>Browse Available Gigs</h2>
      {jobs.length === 0 ? (
        <p style={messageStyle}>No jobs found at the moment. Check back soon for new opportunities!</p>
      ) : (
        <div style={jobGridStyle}>
          {jobs.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id} style={linkStyle}>
              <div
                style={jobCardStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, jobCardHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, jobCardStyle)} // Reset to original style
              >
                <div style={{
                  height: '160px', // Placeholder for image, typical for gig cards
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '14px',
                  borderBottom: '1px solid #eee',
                  // You could replace this with an actual image if job.imageUrl exists
                }}>
                  {job.subject ? job.subject : 'No Image'}
                </div>
                <div style={cardContentStyle}>
                  <div>
                    <h3 style={jobTitleStyle}>{job.title}</h3>
                    <p style={jobDetailStyle}>
                      <strong style={{color: '#404145'}}>Subject:</strong> {job.subject}
                    </p>
                    <p style={jobDetailStyle}>
                      <strong style={{color: '#404145'}}>Location:</strong> {job.location || 'Not specified'}
                    </p>
                  </div>
                  {/* You can add more details here, like a 'starting from' price if applicable */}
                  <div style={{
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {/* Placeholder for price or 'View Details' button if desired */}
                    <span style={{ fontSize: '15px', color: '#62646a' }}>
                      Click to view details
                    </span>
                    {/* <button style={{ ...fiverrButtonStyle, ...fiverrButtonHoverStyle }}>View Gig</button> */}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    <div style={{ height: '100px' }}></div>
    <Footer/>
    </>
  );
};

export default JobList;