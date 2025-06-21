import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TutorProfile = () => {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await axios.get('/api/tutors/' + id + '/');
        setTutor(response.data);
      } catch (err) {
        setError('Failed to fetch tutor profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id]);

  if (loading) return <p>Loading tutor profile...</p>;
  if (error) return <p>{error}</p>;
  if (!tutor) return <p>Tutor not found.</p>;

  return (
    <div>
      <h2>{tutor.username}</h2>
      <p><strong>Email:</strong> {tutor.email}</p>
      <p><strong>Location:</strong> {tutor.location || 'Not specified'}</p>
      <p><strong>Role:</strong> {tutor.role}</p>
      <p><strong>Date Joined:</strong> {new Date(tutor.date_joined).toLocaleDateString()}</p>
      
      <div>
        <h3>Contact Tutor</h3>
        <button onClick={() => alert('Contact functionality to be implemented')}>
          Send Message
        </button>
      </div>
    </div>
  );
};

export default TutorProfile;
