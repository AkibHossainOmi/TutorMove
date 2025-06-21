import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jobAPI } from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
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
          // Check if user has applied to this job
          const applicationsResponse = await jobAPI.getMyApplications();
          const applied = applicationsResponse.data.results.find(app => app.job.id === id);
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
      showNotification('Please login to apply for jobs.', 'error');
      return;
    }
    setIsApplying(true);
    try {
      const response = await jobAPI.applyToJob({ job: id, applicant: user.id });
      if (response.success) {
        showNotification('Application submitted successfully.', 'success');
        setApplicationStatus('pending');
      } else {
        showNotification(response.error || 'Failed to apply for job.', 'error');
      }
    } catch (err) {
      showNotification('Failed to apply for job.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return <p>Loading job details...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <div>
      <h2>{job.title}</h2>
      <p><strong>Subject:</strong> {job.subject}</p>
      <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
      <p><strong>Description:</strong> {job.description}</p>
      <p><strong>Posted by:</strong> {job.student}</p>
      <div>
        {/* Apply button */}
        {applicationStatus ? (
          <p>Your application status: {applicationStatus}</p>
        ) : (
          <button onClick={handleApply} disabled={isApplying}>
            {isApplying ? 'Applying...' : 'Apply for this Job'}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
