import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Users,
  Briefcase,
  DollarSign,
  Activity,
  Search,
  Bell,
  Settings,
  Shield,
  FileText,
  UserCheck,
  Trash2,
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_users: 0,
    active_jobs: 0,
    total_revenue: 0,
    recent_activity: []
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Determine if the user is allowed to view this page.
    if (user && user.user_type !== 'admin') {
      navigate('/dashboard'); // Redirect non-admins
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Stats
        const statsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin-dashboard/stats/`, { headers });
        setStats(statsRes.data);

        // Fetch Users (if on users tab or initially to have data ready, but let's fetch on tab switch to be efficient)
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'jobs') fetchJobs();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/jobs/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const token = localStorage.getItem('access_token');
      const action = isBlocked ? 'unblock' : 'block';
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/${action}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to close this job?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/jobs/${jobId}/close/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs();
    } catch (error) {
      console.error("Error closing job:", error);
      alert("Failed to close job");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/jobs/${jobId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 border-l-4" style={{ borderColor: color }}>
      <div className={`p-3 rounded-full bg-opacity-20`} style={{ backgroundColor: color }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg hidden md:block z-10">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-indigo-700 flex items-center">
              <Shield className="mr-2" /> Admin
            </h2>
          </div>
          <nav className="mt-6 px-4">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'users', label: 'Manage Users', icon: Users },
              { id: 'jobs', label: 'Manage Jobs', icon: Briefcase },
              { id: 'payments', label: 'Payments', icon: DollarSign },
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'moderators', label: 'Moderators', icon: UserCheck },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-indigo-200">
                A
              </div>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.total_users}
                  icon={Users}
                  color="#4F46E5"
                />
                <StatCard
                  title="Active Jobs"
                  value={stats.active_jobs}
                  icon={Briefcase}
                  color="#10B981"
                />
                <StatCard
                  title="Total Revenue"
                  value={`$${stats.total_revenue}`}
                  icon={DollarSign}
                  color="#F59E0B"
                />
                <StatCard
                  title="Pending Reports"
                  value={stats.pending_reports || 0}
                  icon={Shield}
                  color="#EF4444"
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {stats.recent_activity.length > 0 ? (
                    stats.recent_activity.map((activity, index) => (
                      <div key={index} className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors">
                        <div className="bg-blue-100 p-2 rounded-full mr-4 text-blue-600">
                          <Activity size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                          <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">No recent activity</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">User Management</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Joined</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users
                      .filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                              {u.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{u.username}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">{u.user_type}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.is_active ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBlockUser(u.id, !u.is_active)}
                              className={`p-1 rounded hover:bg-gray-200 ${u.is_active ? 'text-orange-500' : 'text-green-500'}`}
                              title={u.is_active ? "Block User" : "Unblock User"}
                            >
                              {u.is_active ? <Ban size={18} /> : <CheckCircle size={18} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1 rounded hover:bg-gray-200 text-red-500"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

           {activeTab === 'jobs' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Job Management</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                      <th className="px-6 py-3">Title/Description</th>
                      <th className="px-6 py-3">Posted By</th>
                      <th className="px-6 py-3">Service</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobs
                      .filter(j => j.description?.toLowerCase().includes(searchTerm.toLowerCase()) || j.service_type?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(j => (
                      <tr key={j.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800 truncate max-w-xs">{j.description || j.title || "No description"}</p>
                          <p className="text-xs text-gray-500">{new Date(j.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{j.student ? j.student.username : 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{j.service_type}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${j.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {j.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {j.status === 'Open' && (
                              <button
                                onClick={() => handleCloseJob(j.id)}
                                className="p-1 rounded hover:bg-gray-200 text-orange-500"
                                title="Close Job"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteJob(j.id)}
                              className="p-1 rounded hover:bg-gray-200 text-red-500"
                              title="Delete Job"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
