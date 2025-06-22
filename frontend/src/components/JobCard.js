import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css'; // Ensure global styles are applied

// BuyCreditsModal Component
const BuyCreditsModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: 'white', borderRadius: 8, padding: '32px 30px', maxWidth: 350, textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: 15 }}>Insufficient Credits</h3>
        <p>You need more credits to apply for this job.</p>
        <button
          onClick={() => navigate('/credit-purchase')}
          style={{
            display: 'inline-block',
            background: '#007bff',
            color: 'white',
            borderRadius: 5,
            padding: '9px 26px',
            fontWeight: 500,
            margin: '20px 0 0',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Buy Credits
        </button>
        <div>
          <button
            onClick={onClose}
            style={{
              marginTop: 14,
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '7px 18px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// UpgradePremiumModal Component
const UpgradePremiumModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: 'white', borderRadius: 8, padding: '32px 30px', maxWidth: 370, textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: 15 }}>Upgrade to Premium</h3>
        <p>
          <b>You’ve reached your free job application limit for this month.</b>
          <br />Upgrade to Premium for <b>unlimited job applies</b> and extra features!
        </p>
        <button
          onClick={() => navigate('/credit-purchase?premium=1')}
          style={{
            display: 'inline-block',
            background: '#ffc107',
            color: '#212529',
            borderRadius: 5,
            padding: '9px 26px',
            fontWeight: 500,
            margin: '20px 0 0',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Upgrade Now
        </button>
        <div>
          <button
            onClick={onClose}
            style={{
              marginTop: 14,
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '7px 18px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ job }) => {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showUpgradePremium, setShowUpgradePremium] = useState(false);
  const [error, setError] = useState('');

  // Handler for applying to a job
  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      // Use correct endpoint for apply (adjust as needed)
      const res = await axios.post(`/api/applications/`, { job: job.id });
      setApplied(true);
      setError('');
    } catch (err) {
      let msg =
        err.response?.data?.error ||
        (err.response?.data && typeof err.response.data === 'string' ? err.response.data : '') ||
        'Failed to apply for job.';
      setError(msg);

      // Modal logic: show the right modal for limit/credit
      if (msg.toLowerCase().includes('premium')) {
        setShowUpgradePremium(true);
      } else if (msg.toLowerCase().includes('credit')) {
        setShowBuyCredits(true);
      }
    }
    setApplying(false);
  };

  return (
    <div
      className="job-card"
      style={{
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        margin: '10px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#212529' }}>
          {job.title || 'Job Title'}
        </h3>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>
          📍 {job.location || 'Location not specified'}
        </p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <p style={{ 
          margin: '0 0 10px 0', 
          fontSize: '14px', 
          color: '#495057',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {job.description || 'No description provided'}
        </p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <span style={{
            backgroundColor: '#e7f3ff',
            color: '#0066cc',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            💰 {job.budget ? `$${job.budget}` : 'Budget negotiable'}
          </span>
          <span style={{
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            📚 {job.subject || 'General'}
          </span>
          <span style={{
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            ⏰ {job.duration || 'Flexible'}
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6c757d' }}>
          Posted by: <strong>{job.student?.username || 'Anonymous Student'}</strong>
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
          Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{
            backgroundColor: job.status === 'open' ? '#d1ecf1' : '#f8d7da',
            color: job.status === 'open' ? '#0c5460' : '#721c24',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {job.status === 'open' ? '🟢 Open' : '🔴 Closed'}
          </span>
          <span style={{
            backgroundColor: '#e9ecef',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#495057'
          }}>
            👥 {Math.floor(Math.random() * 15) + 1} applicants
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link 
            to={`/jobs/${job.id}`}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            View Details
          </Link>
          {job.status === 'open' && (
            <button
              onClick={handleApply}
              disabled={applying || applied}
              style={{
                backgroundColor: applied ? '#6c757d' : '#007bff',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: applying || applied ? 'not-allowed' : 'pointer'
              }}
            >
              {applied ? 'Applied' : (applying ? 'Applying...' : 'Apply Now')}
            </button>
          )}
        </div>
      </div>
      {error && (
        <div style={{ color: 'red', fontSize: '13px', marginTop: '8px' }}>{error}</div>
      )}
      <BuyCreditsModal open={showBuyCredits} onClose={() => setShowBuyCredits(false)} />
      <UpgradePremiumModal open={showUpgradePremium} onClose={() => setShowUpgradePremium(false)} />
    </div>
  );
};

export default JobCard;
