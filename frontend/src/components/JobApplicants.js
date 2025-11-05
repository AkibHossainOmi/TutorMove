import React, { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
import BuyCreditsModal from './BuyCreditsModal';
import { jobAPI, contactUnlockAPI } from '../utils/apiService';

const JobApplicants = ({ jobId, job }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [unlockingId, setUnlockingId] = useState(null);
  const [showBuyCredits, setShowBuyCredits] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchApplicants = async () => {
      try {
        const response = await jobAPI.getJobApplicants(jobId);
        if (!isMounted) return;

        let dataWithState = [];

        if (job?.status === 'Assigned' && job.assigned_tutor) {
          // Show only the assigned tutor
          const assignedTutor = response.data.find(t => t.id === job.assigned_tutor);
          if (assignedTutor) {
            dataWithState = [{
              ...assignedTutor,
              isUnlocked: true, // assigned tutor info should always be visible
              contactInfo: { email: assignedTutor.email || '', phone: assignedTutor.phone || '' },
              chosen: true,
            }];
          }
        } else {
          // Show all applicants if job is not assigned
          dataWithState = response.data.map(tutor => ({
            ...tutor,
            isUnlocked: !!(tutor.email || tutor.phone),
            contactInfo: { email: tutor.email || '', phone: tutor.phone || '' },
            chosen: false,
          }));
        }

        setApplicants(dataWithState);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching applicants:', err);
        setError('Failed to load applicants.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchApplicants();
    return () => { isMounted = false; };
  }, [jobId, job]);

  const handleUnlock = async (tutorId, index) => {
    if (!currentUser || currentUser.user_type !== 'student') return;
    setUnlockingId(tutorId);

    try {
      const res = await contactUnlockAPI.unlockContact(tutorId);
      setApplicants(prev => {
        const newApplicants = [...prev];
        newApplicants[index].isUnlocked = true;
        newApplicants[index].contactInfo = {
          email: res.data.email || prev[index].contactInfo.email || '',
          phone: res.data.phone || prev[index].contactInfo.phone || '',
        };
        return newApplicants;
      });
    } catch (err) {
      console.error('Unlock error:', err);
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to unlock contact info.';
      if (msg.toLowerCase().includes('point') || err.response?.status === 402) {
        setShowBuyCredits(true);
      }
    } finally {
      setUnlockingId(null);
    }
  };

  const handleChooseTutor = async (tutorId, index) => {
    if (!currentUser || currentUser.user_type !== 'student') return;
    if (job?.status === 'Assigned') return; // Prevent choosing if already assigned

    try {
      await jobAPI.chooseTutor(jobId, tutorId);
      setApplicants(prev => prev.map(tutor => ({
        ...tutor,
        chosen: tutor.id === tutorId,
      })));
    } catch (err) {
      console.error('Choose tutor error:', err);
      alert(err.response?.data?.detail || 'Failed to choose tutor.');
    }
  };

  if (loading) return <p className="text-gray-500">Loading applicants...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!applicants.length) return <p className="text-gray-500">{job?.status === 'Assigned' ? 'Assigned tutor not found.' : 'No applicants yet.'}</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-xl font-semibold mb-4">
        {job?.status === 'Assigned' ? 'Assigned Tutor' : 'Applicants'}
      </h3>
      <ul className="space-y-3">
        {applicants.map((tutor, index) => (
          <li key={tutor.id} className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FiUser className="text-2xl text-blue-900" />
              <p className="font-medium text-slate-800">{tutor.username}</p>
            </div>

            {currentUser?.user_type === 'student' && !tutor.chosen && job?.status === 'Open' && (
              <div className="flex flex-wrap gap-3 mb-2">
                {!tutor.isUnlocked && !tutor.contactInfo.email && !tutor.contactInfo.phone && (
                  <button
                    onClick={() => handleUnlock(tutor.id, index)}
                    disabled={unlockingId === tutor.id}
                    className={`px-4 py-2 rounded-md text-white font-medium text-sm shadow-sm transition-all ${
                      unlockingId === tutor.id
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {unlockingId === tutor.id ? 'Unlocking...' : 'Unlock (1 point)'}
                  </button>
                )}
                <button
                  onClick={() => handleChooseTutor(tutor.id, index)}
                  className="px-4 py-2 rounded-md text-white font-medium text-sm shadow-sm bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Choose Tutor
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <FiMail className="text-gray-400" />
                <span className="text-sm text-slate-500">
                  {tutor.contactInfo.email || 'Unlock to view'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-gray-400" />
                <span className="text-sm text-slate-500">
                  {tutor.contactInfo.phone || 'Unlock to view'}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <BuyCreditsModal
        show={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onBuyCredits={() => (window.location.href = '/point-purchase')}
        message="You need more points to unlock contact information. Please purchase points to proceed."
      />
    </div>
  );
};

export default JobApplicants;
