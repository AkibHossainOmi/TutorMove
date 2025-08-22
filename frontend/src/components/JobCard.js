import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure global styles are applied

// // BuyCreditsModal Component
// const BuyCreditsModal = ({ open, onClose }) => {
//   const navigate = useNavigate();
//   if (!open) return null;
//   return (
//     <div style={{
//       position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
//       background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
//     }}>
//       <div style={{
//         background: 'white', borderRadius: 8, padding: '32px 30px', maxWidth: 350, textAlign: 'center'
//       }}>
//         <h3 style={{ marginBottom: 15 }}>Insufficient Credits</h3>
//         <p>You need more credits to apply for this job.</p>
//         <button
//           onClick={() => navigate('/credit-purchase')}
//           style={{
//             display: 'inline-block',
//             background: '#007bff',
//             color: 'white',
//             borderRadius: 5,
//             padding: '9px 26px',
//             fontWeight: 500,
//             margin: '20px 0 0',
//             border: 'none',
//             cursor: 'pointer'
//           }}
//         >
//           Buy Credits
//         </button>
//         <div>
//           <button
//             onClick={onClose}
//             style={{
//               marginTop: 14,
//               background: '#6c757d',
//               color: 'white',
//               border: 'none',
//               borderRadius: 4,
//               padding: '7px 18px',
//               cursor: 'pointer'
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // UpgradePremiumModal Component
// const UpgradePremiumModal = ({ open, onClose }) => {
//   const navigate = useNavigate();
//   if (!open) return null;
//   return (
//     <div style={{
//       position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
//       background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
//     }}>
//       <div style={{
//         background: 'white', borderRadius: 8, padding: '32px 30px', maxWidth: 370, textAlign: 'center'
//       }}>
//         <h3 style={{ marginBottom: 15 }}>Upgrade to Premium</h3>
//         <p>
//           <b>You’ve reached your free job application limit for this month.</b>
//           <br />Upgrade to Premium for <b>unlimited job applies</b> and extra features!
//         </p>
//         <button
//           onClick={() => navigate('/credit-purchase?premium=1')}
//           style={{
//             display: 'inline-block',
//             background: '#ffc107',
//             color: '#212529',
//             borderRadius: 5,
//             padding: '9px 26px',
//             fontWeight: 500,
//             margin: '20px 0 0',
//             border: 'none',
//             cursor: 'pointer'
//           }}
//         >
//           Upgrade Now
//         </button>
//         <div>
//           <button
//             onClick={onClose}
//             style={{
//               marginTop: 14,
//               background: '#6c757d',
//               color: 'white',
//               border: 'none',
//               borderRadius: 4,
//               padding: '7px 18px',
//               cursor: 'pointer'
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

const JobCard = ({ job }) => {
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

      <div style={{ marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
            backgroundColor: job.status === 'Open' ? '#d1ecf1' : '#f8d7da',
            color: job.status === 'Open' ? '#0c5460' : '#721c24',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {job.status === 'Open' ? '🟢 Open' : '🔴 Closed'}
          </span>
          <span style={{
            backgroundColor: '#e9ecef',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#495057'
          }}>
            👥 {job.applicants_count} applicants
          </span>
        </div>

        <Link 
          to={`/jobs/${job.id}`}
          style={{
            backgroundColor: job.status === 'Open' ? '#007bff' : '#6c757d',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: job.status === 'Open' ? 'pointer' : 'not-allowed'
          }}
        >
          {job.status === 'Open' ? 'View & Apply' : 'View Details'}
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
