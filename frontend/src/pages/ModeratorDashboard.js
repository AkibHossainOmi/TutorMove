import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Users, Briefcase, Activity, Shield,
  FileText, AlertTriangle, Flag, BookOpen,
  RefreshCw, Bell, TrendingUp, CheckCircle, XCircle, Clock
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
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'gigs', label: 'Gigs', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'questions', label: 'Questions', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: Flag },
  ];

  const renderMinimalOverview = () => {
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
          <StatCard
            title="Pending Questions"
            value={stats?.pending_questions || 0}
            icon={AlertTriangle}
          />
          <StatCard
            title="Pending Reports"
            value={stats?.pending_reports || 0}
            icon={Flag}
          />
          <StatCard
            title="Active Jobs"
            value={stats?.active_jobs || 0}
            icon={Briefcase}
          />
          <StatCard
            title="Total Gigs"
            value={stats?.total_gigs || 0}
            icon={FileText}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Moderation */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Content Moderation
            </h3>
            <div className="space-y-3">
              <ProgressBar
                label="Approved Questions"
                value={stats?.approved_questions || 0}
                total={(stats?.approved_questions || 0) + (stats?.pending_questions || 0) + (stats?.rejected_questions || 0) || 1}
              />
              <ProgressBar
                label="Pending Questions"
                value={stats?.pending_questions || 0}
                total={(stats?.approved_questions || 0) + (stats?.pending_questions || 0) + (stats?.rejected_questions || 0) || 1}
              />
              <ProgressBar
                label="Rejected Questions"
                value={stats?.rejected_questions || 0}
                total={(stats?.approved_questions || 0) + (stats?.pending_questions || 0) + (stats?.rejected_questions || 0) || 1}
              />
            </div>
          </div>

          {/* Report Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Report Status
            </h3>
            <div className="space-y-3">
              <ProgressBar
                label="Resolved Reports"
                value={stats?.resolved_reports || 0}
                total={(stats?.resolved_reports || 0) + (stats?.pending_reports || 0) || 1}
              />
              <ProgressBar
                label="Pending Reports"
                value={stats?.pending_reports || 0}
                total={(stats?.resolved_reports || 0) + (stats?.pending_reports || 0) || 1}
              />
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Platform Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Questions" value={stats?.total_questions || 0} />
            <MetricCard label="Total Answers" value={stats?.total_answers || 0} />
            <MetricCard label="Active Subjects" value={stats?.active_subjects || 0} />
            <MetricCard label="Total Jobs" value={stats?.total_jobs || 0} />
          </div>
        </div>

        {/* Job Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Status Distribution
          </h3>
          <div className="space-y-3">
            <ProgressBar
              label="Open Jobs"
              value={stats?.open_jobs || 0}
              total={stats?.total_jobs || 1}
            />
            <ProgressBar
              label="In Progress"
              value={stats?.in_progress_jobs || 0}
              total={stats?.total_jobs || 1}
            />
            <ProgressBar
              label="Completed Jobs"
              value={stats?.completed_jobs || 0}
              total={stats?.total_jobs || 1}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'overview') return renderMinimalOverview();

    switch (activeTab) {
      case 'subjects':
        return <ResourceManager
          resourceName="Subject"
          apiEndpoint="/api/admin/subjects/"
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Aliases', render: s => Array.isArray(s.aliases) ? s.aliases.join(', ') : s.aliases },
            { header: 'Active', render: s => s.is_active ? 'Yes' : 'No' }
          ]}
          formFields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'aliases', label: 'Aliases (comma separated)' },
            { name: 'is_active', label: 'Is Active', type: 'checkbox' }
          ]}
          canEdit={false}
          canCreate={true}
          canDelete={true}
        />;
      case 'gigs':
        return <ResourceManager
          resourceName="Gig"
          apiEndpoint="/api/admin/gigs/"
          columns={[
            { header: 'Title', accessor: 'title' },
            { header: 'Tutor', accessor: 'tutor' },
            { header: 'Subject', accessor: 'subject' },
            { header: 'Price', render: g => `৳${g.price || 0}` },
            { header: 'Status', render: g => <span className={`px-2 py-0.5 rounded-full text-xs ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{g.is_active ? 'Active' : 'Inactive'}</span> },
          ]}
          formFields={[]}
          canEdit={false}
          canCreate={false}
          canDelete={true}
        />;
      case 'jobs':
        return <ResourceManager
          resourceName="Job"
          apiEndpoint="/api/admin/jobs/"
          columns={[
            { header: 'Title', accessor: 'title' },
            { header: 'Student', render: j => j.student ? j.student.username : 'N/A' },
            { header: 'Subjects', render: j => j.subject_details ? j.subject_details.join(', ') : '' },
            { header: 'Service', accessor: 'service_type' },
            { header: 'Status', render: j => <span className={`px-2 py-0.5 rounded-full text-xs ${j.status === 'Open' ? 'bg-green-100 text-green-700' : j.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{j.status}</span> },
          ]}
          formFields={[]}
          canEdit={false}
          canCreate={false}
          canDelete={true}
        />;
      case 'questions':
        return <ResourceManager
          resourceName="Question"
          apiEndpoint="/api/admin/questions/"
          columns={[
            { header: 'Title', accessor: 'title' },
            { header: 'Student', render: q => q.student ? q.student.username : 'N/A' },
            { header: 'Status', render: q => {
              const statusColors = {
                'approved': 'bg-green-100 text-green-700',
                'pending': 'bg-yellow-100 text-yellow-700',
                'rejected': 'bg-red-100 text-red-700'
              };
              return <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[q.approval_status] || 'bg-gray-100 text-gray-700'}`}>{q.approval_status}</span>;
            }},
            { header: 'Answers', accessor: 'answers_count' },
            { header: 'Upvotes', accessor: 'total_upvotes' },
          ]}
          formFields={[]}
          canEdit={false}
          canCreate={false}
          canDelete={true}
        />;
      case 'reports':
        return <ResourceManager
          resourceName="Report"
          apiEndpoint="/api/admin/reports/"
          columns={[
            { header: 'Content Type', accessor: 'content_type' },
            { header: 'Reason', accessor: 'reason' },
            { header: 'Reporter', render: r => r.reporter ? r.reporter.username : 'N/A' },
            { header: 'Status', render: r => {
              const statusColors = {
                'pending': 'bg-yellow-100 text-yellow-700',
                'resolved': 'bg-green-100 text-green-700',
                'dismissed': 'bg-gray-100 text-gray-700'
              };
              return <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status}</span>;
            }},
            { header: 'Created', render: r => new Date(r.created_at).toLocaleDateString() },
          ]}
          formFields={[]}
          canEdit={false}
          canCreate={false}
          canDelete={true}
        />;
      default: return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Minimal Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Moderator Panel</div>
                <div className="text-xs text-purple-600">{user?.username}</div>
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
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 mt-auto bg-gray-50">
            <div className="text-xs text-purple-600 font-medium">👮 Content Moderator</div>
          </div>
        </aside>

        {/* Mobile Menu Toggle (Hidden on desktop) */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <button className="bg-gray-900 text-white p-3 rounded-full shadow-lg">
            <Shield className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 pt-16">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 capitalize">{activeTab}</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage {activeTab}</p>
                </div>
                <button
                  onClick={fetchDashboardStats}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 self-start sm:self-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Minimal Stat Card with Color
const StatCard = ({ title, value, icon: Icon }) => {
  const iconColors = {
    'Pending Questions': 'text-yellow-500 bg-yellow-50',
    'Pending Reports': 'text-red-500 bg-red-50',
    'Active Jobs': 'text-purple-500 bg-purple-50',
    'Total Gigs': 'text-cyan-500 bg-cyan-50',
  };

  const colorClass = iconColors[title] || 'text-purple-500 bg-purple-50';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 font-medium">{title}</span>
        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
};

// Simple Progress Bar with Color
const ProgressBar = ({ label, value, total }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const getColor = () => {
    if (label.includes('Approved') || label.includes('Successful') || label.includes('Completed') || label.includes('Resolved')) {
      return 'bg-gradient-to-r from-green-500 to-emerald-500';
    }
    if (label.includes('Pending')) {
      return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    }
    if (label.includes('Failed') || label.includes('Rejected')) {
      return 'bg-gradient-to-r from-red-500 to-rose-500';
    }
    if (label.includes('Open')) {
      return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
    if (label.includes('In Progress')) {
      return 'bg-gradient-to-r from-purple-500 to-indigo-500';
    }
    return 'bg-gradient-to-r from-purple-500 to-indigo-500';
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`${getColor()} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

// Metric Card
const MetricCard = ({ label, value }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
    <div className="text-xs text-gray-600 mt-1">{label}</div>
  </div>
);

export default ModeratorDashboard;
