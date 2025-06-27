import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyStatus, setApplyStatus] = useState('idle');

  // Get user from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`/api/jobs/${id}/`);
        setJob(response.data);
      } catch (err) {
        setError('Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user || !user.user_id) {
      alert('You must be logged in to apply.');
      return;
    }
    if (!job || !job.student) {
      alert('Job data incomplete: no poster info found.');
      return;
    }

    setApplyStatus('loading');
    try {
      // 1) Deduct 1 credit from user
      await axios.post('http://localhost:8000/api/credit/update/', {
        user_id: user.user_id,
        amount: 1,
        isincrease: false,
      });

      // 2) Create notification for job poster (to_user)
      await axios.post('http://localhost:8000/api/notifications/create/', {
        from_user: user.user_id,
        to_user: job.student,
        message: `${user.username} applied to your job "${job.title}"`,
      });

      setApplyStatus('success');
    } catch (err) {
      console.error('Error during apply:', err.response?.data || err.message);
      setApplyStatus('failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderContent = () => {
    if (loading) return <p style={styles.statusText}>Loading job details...</p>;
    if (error) return <p style={styles.statusText}>{error}</p>;
    if (!job) return <p style={styles.statusText}>Job not found.</p>;

    return (
      <div style={styles.card}>
        <div style={styles.banner}></div>

        <div style={styles.cardContent}>
          <h1 style={styles.title}>{job.title}</h1>

          <div style={styles.metaGrid}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Posted by:</span>
              <span style={styles.metaValue}>{job.student_name || 'Unknown'}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Subject:</span>
              <span style={styles.metaValue}>{typeof job.subject === 'object' ? job.subject.name : job.subject}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Location:</span>
              <span style={styles.metaValue}>{job.location || 'Not specified'}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Posted on:</span>
              <span style={styles.metaValue}>{formatDate(job.created_at)}</span>
            </div>
          </div>

          <div style={styles.descriptionSection}>
            <h3 style={styles.subtitle}>📝 Description</h3>
            <p style={styles.description}>{job.description}</p>
          </div>

          <div style={styles.buttonWrapper}>
            <button
              style={styles.applyButton}
              onClick={handleApply}
              disabled={applyStatus === 'loading' || applyStatus === 'success'}
            >
              {applyStatus === 'loading'
                ? 'Applying...'
                : applyStatus === 'success'
                ? 'Applied ✔'
                : 'Apply for this Job'}
            </button>
            {applyStatus === 'failed' && (
              <p style={{ color: 'red', marginTop: '10px' }}>Failed to apply. Try again.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.contentWrapper}>{renderContent()}</div>
      </div>
      <Footer />
    </>
  );
};

// Styles unchanged
const styles = {
  container: {
    minHeight: 'calc(100vh - 160px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '80px 20px 60px',
    backgroundColor: '#f3f4f6',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '840px',
  },
  statusText: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#555',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  banner: {
    height: '6px',
    background: 'linear-gradient(to right, #3b82f6, #9333ea)',
  },
  cardContent: {
    padding: '40px 32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: '24px',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '18px',
    marginBottom: '32px',
  },
  metaItem: {
    fontSize: '15px',
    color: '#4b5563',
    display: 'flex',
    flexDirection: 'column',
  },
  metaLabel: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px',
    marginBottom: '4px',
  },
  metaValue: {
    fontWeight: '500',
    fontSize: '15px',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#111827',
  },
  descriptionSection: {
    marginBottom: '30px',
  },
  description: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.75',
    whiteSpace: 'pre-wrap',
  },
  buttonWrapper: {
    textAlign: 'center',
    marginTop: '30px',
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '14px 36px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59,130,246,0.2)',
    transition: 'all 0.2s ease',
  },
};

export default JobDetail;
