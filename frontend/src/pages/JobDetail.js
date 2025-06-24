import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading job details...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>Job not found.</p>;

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ padding: 40, maxWidth: 700, margin: 'auto', backgroundColor: '#fff', borderRadius: 12 }}>
      <h1>{job.title}</h1>
      <p><strong>Posted by:</strong> {job.student_name || 'Unknown'}</p>
      <p><strong>Subject:</strong> {typeof job.subject === 'object' ? job.subject.name : job.subject}</p>
      <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
      <p><strong>Posted on:</strong> {formatDate(job.created_at)}</p>
      <div>
        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
      </div>
    </div>
  );
};

export default JobDetail;
