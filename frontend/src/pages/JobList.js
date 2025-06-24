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
        const response = await axios.get('http://localhost:8000/api/jobs/');
        setJobs(response.data);
        console.log(response.data);
      } catch (err) {
        setError('Failed to fetch jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Styles
  const containerStyle = {
    fontFamily: '"Macan", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    padding: '40px 20px',
    backgroundColor: '#f8f8f8',
    minHeight: '100vh',
  };

  const headerStyle = {
    textAlign: 'center',
    fontSize: '36px',
    fontWeight: '700',
    color: '#404145',
    marginBottom: '40px',
  };

  const jobGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const imageWrapperStyle = {
    height: '180px',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '32px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const contentStyle = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#222325',
    marginBottom: '10px',
    lineHeight: '1.4',
  };

  const detailStyle = {
    fontSize: '14px',
    color: '#7a7d85',
    marginBottom: '5px',
  };

  const footerStyle = {
    marginTop: 'auto',
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    fontSize: '14px',
    color: '#62646a',
  };

  const linkStyle = {
    textDecoration: 'none',
  };

  const messageStyle = {
    textAlign: 'center',
    padding: '20px',
    fontSize: '18px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    color: '#62646a',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  };

  const errorStyle = {
    ...messageStyle,
    color: '#d62020',
    backgroundColor: '#ffe6e6',
    border: '1px solid #ffcccc',
  };

  // Render logic
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
      <Navbar />
      <div style={{ height: '150px' }}></div>
      <div style={containerStyle}>
        <h2 style={headerStyle}>Browse Available Gigs</h2>
        {jobs.length === 0 ? (
          <p style={messageStyle}>No jobs found at the moment. Check back soon!</p>
        ) : (
          <div style={jobGridStyle}>
            {jobs.map((job) => {
              const initials = job.title ? job.title.slice(0, 3).toUpperCase() : 'JOB';
              return (
                <Link to={`/jobs/${job.id}`} key={job.id} style={linkStyle}>
                  <div
                    style={cardStyle}
                    onMouseEnter={(e) =>
                      Object.assign(e.currentTarget.style, {
                        ...cardStyle,
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      })
                    }
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...cardStyle })}
                  >
                    {/* Image or Full-Cover Initials */}
                    <div style={imageWrapperStyle}>
                      {job.image ? (
                        <img src={job.image} alt={job.title} style={imgStyle} />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* Card Content */}
                    <div style={contentStyle}>
                      <div>
                        <h3 style={titleStyle}>{job.title}</h3>
                        <p style={detailStyle}><strong style={{ color: '#404145' }}>Subject:</strong> {job.subject}</p>
                        <p style={detailStyle}><strong style={{ color: '#404145' }}>Location:</strong> {job.location || 'Not specified'}</p>
                      </div>
                      <div style={footerStyle}>Click to view details</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ height: '100px' }}></div>
      <Footer />
    </>
  );
};

export default JobList;
