import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingGigs, setPendingGigs] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/admin-tools/dashboard/`).then(res => setStats(res.data));
    axios.get(`${process.env.REACT_APP_API_URL}/api/admin-tools/pending_gigs/`).then(res => setPendingGigs(res.data));
    axios.get(`${process.env.REACT_APP_API_URL}/api/admin-tools/reports/`).then(res => setReports(res.data));
  }, []);

  const approveGig = async (gigId) => {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/admin-tools/${gigId}/approve_gig/`);
    setPendingGigs(prev => prev.filter(gig => gig.id !== gigId));
  };

  const blockUser = async (userId) => {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/admin-tools/${userId}/block_user/`);
    alert("User blocked!");
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Stats</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>

      <h2>Pending Gigs</h2>
      <ul>
        {pendingGigs.map(gig => (
          <li key={gig.id}>
            {gig.title} (by {gig.teacher_username})
            <button onClick={() => approveGig(gig.id)}>Approve</button>
          </li>
        ))}
      </ul>

      <h2>Abuse Reports</h2>
      <ul>
        {reports.map(report => (
          <li key={report.id}>
            {report.message} on {report.target_type} #{report.target_id}
            <button onClick={() => blockUser(report.reported_user_id)}>Block User</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
