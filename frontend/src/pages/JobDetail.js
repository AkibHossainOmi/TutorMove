import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jobAPI } from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobAPI.getJobDetail(id);
        setJob(response.data);

        if (user) {
          const applicationsResponse = await jobAPI.getMyApplications();
          const applied = applicationsResponse.data.results.find(
            (app) => app.job.id === id
          );
          setApplicationStatus(applied ? applied.status : null);
        }
      } catch (err) {
        setError('Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      alert('Please login to apply for jobs.');
      return;
    }
    setIsApplying(true);
    try {
      const response = await jobAPI.applyToJob({ job: id, applicant: user.id });
      if (response.success) {
        alert('Application submitted successfully.');
        setApplicationStatus('pending');
      } else {
        alert(response.error || 'Failed to apply for job.');
      }
    } catch (err) {
      alert('Failed to apply for job.');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return <div className="job-detail-container"><p>Loading job details...</p></div>;
  if (error) return <div className="job-detail-container"><p>{error}</p></div>;
  if (!job) return <div className="job-detail-container"><p>Job not found.</p></div>;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{job.title}</h1>

        <div style={styles.meta}>
          <p><strong>Posted by:</strong> {job.student}</p>
          <p><strong>Subject:</strong> {job.subject}</p>
          <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
          <p><strong>Posted on:</strong> {formatDate(job.created_at)}</p>
        </div>

        <div style={styles.descriptionBox}>
          <h3>Description</h3>
          <p style={styles.description}>{job.description}</p>
        </div>

        <div style={styles.actionBox}>
          {applicationStatus ? (
            <p style={styles.status}>Your application status: <strong>{applicationStatus}</strong></p>
          ) : (
            <button
              onClick={handleApply}
              disabled={isApplying}
              style={isApplying ? styles.buttonDisabled : styles.button}
            >
              {isApplying ? 'Applying...' : 'Apply for this Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: '40px 20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    maxWidth: '700px',
    width: '100%',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '20px',
  },
  meta: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  descriptionBox: {
    marginBottom: '30px',
  },
  description: {
    fontSize: '16px',
    color: '#444',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  actionBox: {
    marginTop: '20px',
  },
  status: {
    fontSize: '16px',
    color: '#3b82f6',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'not-allowed',
    fontWeight: '600',
  },
};

export default JobDetail;
