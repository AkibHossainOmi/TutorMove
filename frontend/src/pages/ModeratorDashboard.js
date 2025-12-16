import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Users, Briefcase, FileText, AlertTriangle, Flag, BookOpen,
  RefreshCw, CheckCircle, Shield
} from 'lucide-react';
import { ResourceManager } from '../components/DashboardComponents';
import apiService from '../utils/apiService';

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user && user.user_type !== 'moderator' && user.user_type !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await apiService.get('/api/admin-dashboard/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'gigs', label: 'Gigs', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'questions', label: 'Questions', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: Flag },
  ];

  const renderOverview = () => {
    if (loadingStats) {
      return (
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} />
          <StatCard title="Active Jobs" value={stats?.active_jobs || 0} icon={Briefcase} />
          <StatCard title="Pending Reports" value={stats?.pending_reports || 0} icon={Flag} />
          <StatCard title="Pending Questions" value={stats?.pending_questions || 0} icon={AlertTriangle} />
        </div>

        {/* Content Moderation Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Moderation Queue
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Questions</h4>
              <div className="space-y-3">
                 <ProgressBar label="Pending" value={stats?.pending_questions || 0} total={(stats?.approved_questions || 0) + (stats?.pending_questions || 0) + (stats?.rejected_questions || 0)} color="yellow" />
                 <ProgressBar label="Approved" value={stats?.approved_questions || 0} total={(stats?.approved_questions || 0) + (stats?.pending_questions || 0) + (stats?.rejected_questions || 0)} color="green" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Reports</h4>
              <div className="space-y-3">
                 <ProgressBar label="Pending" value={stats?.pending_reports || 0} total={(stats?.resolved_reports || 0) + (stats?.pending_reports || 0)} color="red" />
                 <ProgressBar label="Resolved" value={stats?.resolved_reports || 0} total={(stats?.resolved_reports || 0) + (stats?.pending_reports || 0)} color="green" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'overview') return renderOverview();

    switch (activeTab) {
      case 'subjects':
        return (
          <ResourceManager
            resourceName="Subject"
            apiEndpoint="/api/admin/subjects/"
            columns={[
              { header: 'Name', render: s => <span className="font-medium text-gray-900 text-sm">{s.name}</span> },
              { header: 'Aliases', render: s => <span className="text-xs text-gray-500">{s.aliases || '-'}</span> },
              {
                header: 'Status',
                render: s => (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${s.is_active ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-100'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                )
              }
            ]}
            formFields={[
              { name: 'name', label: 'Name', required: true },
              { name: 'aliases', label: 'Aliases' },
              { name: 'is_active', label: 'Active', type: 'checkbox' }
            ]}
          />
        );

      case 'gigs':
        return (
          <ResourceManager
            resourceName="Gig"
            apiEndpoint="/api/admin/gigs/"
            columns={[
              { header: 'Title', render: g => <span className="font-medium text-gray-900 text-sm">{g.title}</span> },
              { header: 'Tutor', render: g => <span className="text-sm text-gray-600">{g.tutor}</span> },
              { header: 'Subject', render: g => <span className="text-sm text-gray-900">{g.subject}</span> },
              {
                 header: 'Status',
                 render: g => (
                   <span className={`px-2 py-1 text-xs font-medium rounded ${g.is_active ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-100'}`}>
                     {g.is_active ? 'Active' : 'Inactive'}
                   </span>
                 )
               }
            ]}
            formFields={[]} // Moderators can only delete, not edit/create in this view usually
            disableAdd={true}
            disableEdit={true}
          />
        );

      case 'jobs':
        return (
          <ResourceManager
            resourceName="Job"
            apiEndpoint="/api/admin/jobs/"
            columns={[
              { header: 'Title', render: j => <span className="font-medium text-gray-900 text-sm">{j.title || 'Untitled'}</span> },
              { header: 'Student', render: j => <span className="text-sm text-gray-600">{j.student?.username || 'N/A'}</span> },
              { header: 'Service', render: j => <span className="text-xs text-gray-500">{j.service_type}</span> },
              {
                header: 'Status',
                render: j => (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    j.status === 'Open' ? 'text-green-700 bg-green-50' :
                    j.status === 'Completed' ? 'text-blue-700 bg-blue-50' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {j.status}
                  </span>
                )
              }
            ]}
            formFields={[]}
            disableAdd={true}
            disableEdit={true}
          />
        );

      case 'questions':
        return (
          <ResourceManager
            resourceName="Question"
            apiEndpoint="/api/admin/questions/"
            columns={[
              { header: 'Title', render: q => <span className="font-medium text-gray-900 text-sm">{q.title}</span> },
              { header: 'Student', render: q => <span className="text-sm text-gray-600">{q.student?.username || 'N/A'}</span> },
              {
                 header: 'Status',
                 render: q => (
                   <span className={`px-2 py-1 text-xs font-medium rounded ${
                     q.approval_status === 'approved' ? 'text-green-700 bg-green-50' :
                     q.approval_status === 'pending' ? 'text-yellow-700 bg-yellow-50' :
                     'text-red-700 bg-red-50'
                   }`}>
                     {q.approval_status || 'approved'}
                   </span>
                 )
               }
            ]}
            formFields={[]}
            disableAdd={true}
            disableEdit={true}
            customActions={(item, onUpdate) => (
              <>
                {item.approval_status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await apiService.post(`/api/admin/questions/${item.id}/approve/`);
                        onUpdate();
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        await apiService.post(`/api/admin/questions/${item.id}/reject/`);
                        onUpdate();
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </>
            )}
          />
        );

      case 'reports':
          return (
            <ResourceManager
              resourceName="Report"
              apiEndpoint="/api/admin/reports/"
              columns={[
                { header: 'User', render: r => <span className="font-medium text-gray-900 text-sm">{r.reported_user_id}</span> },
                { header: 'Reason', render: r => <span className="text-sm text-gray-600">{r.reason}</span> },
                { header: 'Type', render: r => <span className="text-xs text-gray-500">{r.target_type}</span> }
              ]}
              formFields={[]}
              disableAdd={true}
            />
          );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Minimal Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Moderator</div>
                <div className="text-xs text-orange-600">{user?.username}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md mb-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 pt-16">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 capitalize">{activeTab}</h1>
                  <p className="text-sm text-gray-500 mt-1">Moderation Dashboard</p>
                </div>
                <button
                  onClick={fetchDashboardStats}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Simple Components Reused from Admin
const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600 font-medium">{title}</span>
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
  </div>
);

const ProgressBar = ({ label, value, total, color = "blue" }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${colors[color] || 'bg-blue-500'} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
