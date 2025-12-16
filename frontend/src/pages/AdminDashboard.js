import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Users, Briefcase, DollarSign, Activity, Shield,
  FileText, AlertTriangle, Flag, BookOpen, Tag, Download,
  TrendingUp, Clock, CheckCircle, XCircle, Package,
  RefreshCw, Search, Plus, Edit, Trash2, Mail, Calendar,
  ArrowUp, ArrowDown, Star, Bell
} from 'lucide-react';
import { ResourceManager, OverviewStats } from '../components/DashboardComponents';
import PaymentStatementDownloader from '../components/PaymentStatementDownloader';
import apiService from '../utils/apiService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user && user.user_type !== 'admin' && user.user_type !== 'moderator') {
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
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'gigs', label: 'Gigs', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'questions', label: 'Questions', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'coupons', label: 'Coupons', icon: Tag },
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
        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} />
          <StatCard title="Total Revenue" value={`৳${stats?.total_revenue || 0}`} icon={DollarSign} />
          <StatCard title="Active Jobs" value={stats?.active_jobs || 0} icon={Briefcase} />
          <StatCard title="Pending Items" value={(stats?.pending_questions || 0) + (stats?.pending_reports || 0)} icon={Bell} />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Questions" value={stats?.total_questions || 0} icon={AlertTriangle} />
          <StatCard title="Total Gigs" value={stats?.total_gigs || 0} icon={FileText} />
          <StatCard title="Total Packages" value={stats?.total_packages || 0} icon={Package} />
          <StatCard title="Active Coupons" value={stats?.active_coupons || 0} icon={Tag} />
        </div>

        {/* User & Content Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Distribution
            </h3>
            <div className="space-y-3">
              <ProgressBar label="Students" value={stats?.student_count || 0} total={stats?.total_users || 1} />
              <ProgressBar label="Tutors" value={stats?.tutor_count || 0} total={stats?.total_users || 1} />
              <ProgressBar label="Moderators" value={stats?.moderator_count || 0} total={stats?.total_users || 1} />
              <ProgressBar label="Admins" value={stats?.admin_count || 0} total={stats?.total_users || 1} />
            </div>
          </div>

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
        </div>

        {/* Financial & Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Statistics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payment Statistics
            </h3>
            <div className="space-y-3">
              <ProgressBar
                label="Successful Payments"
                value={stats?.successful_payments || 0}
                total={stats?.total_payments || 1}
              />
              <ProgressBar
                label="Pending Payments"
                value={stats?.pending_payments || 0}
                total={stats?.total_payments || 1}
              />
              <ProgressBar
                label="Failed Payments"
                value={stats?.failed_payments || 0}
                total={stats?.total_payments || 1}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-semibold text-gray-900">{stats?.total_payments || 0}</span>
              </div>
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
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Jobs</span>
                <span className="font-semibold text-gray-900">{stats?.total_jobs || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Platform Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard label="Total Answers" value={stats?.total_answers || 0} />
            <MetricCard label="Active Subjects" value={stats?.active_subjects || 0} />
            <MetricCard label="Resolved Reports" value={stats?.resolved_reports || 0} />
            <MetricCard label="Pending Reports" value={stats?.pending_reports || 0} />
            <MetricCard label="Premium Users" value={stats?.premium_users || 0} />
            <MetricCard label="Active Gigs" value={stats?.active_gigs || 0} />
          </div>
        </div>

        {/* Report Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Report Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Reports</span>
                <span className="font-medium text-gray-900">{(stats?.resolved_reports || 0) + (stats?.pending_reports || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Resolution Rate</span>
                <span className="font-medium text-gray-900">
                  {((stats?.resolved_reports || 0) / ((stats?.resolved_reports || 0) + (stats?.pending_reports || 0) || 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'overview') return renderMinimalOverview();

    switch (activeTab) {
      case 'users':
        return (
          <ResourceManager
            resourceName="User"
            apiEndpoint="/api/admin/users/"
            columns={[
              {
                header: 'User',
                render: u => (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{u.username}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                )
              },
              {
                header: 'Role',
                render: u => <span className="inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">{u.user_type}</span>
              },
              {
                header: 'Credits',
                render: u => <span className="text-sm text-gray-900">{['admin', 'moderator'].includes(u.user_type) ? 'N/A' : u.credits ?? 0}</span>
              },
              {
                header: 'Status',
                render: u => (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                    u.is_active ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    {u.is_active ? 'Active' : 'Blocked'}
                  </span>
                )
              }
            ]}
            formFields={[
              { name: 'username', label: 'Username', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'first_name', label: 'First Name' },
              { name: 'last_name', label: 'Last Name' },
              { name: 'user_type', label: 'Role', type: 'select', options: [
                {value: 'student', label: 'Student'},
                {value: 'tutor', label: 'Tutor'},
                {value: 'admin', label: 'Admin'},
                {value: 'moderator', label: 'Moderator'}
              ], required: true },
              { name: 'set_credits', label: 'Credits', type: 'number', defaultValue: 0, valueKey: 'credits' },
              { name: 'is_active', label: 'Active Account', type: 'checkbox' },
              { name: 'password', label: 'Password (Optional)', type: 'password' }
            ]}
          />
        );

      case 'subjects':
        return (
          <ResourceManager
            resourceName="Subject"
            apiEndpoint="/api/admin/subjects/"
            columns={[
              { header: 'Name', render: s => <span className="font-medium text-gray-900 text-sm">{s.name}</span> },
              {
                header: 'Aliases',
                render: s => {
                  const aliases = Array.isArray(s.aliases) ? s.aliases : s.aliases?.split(',') || [];
                  return (
                    <div className="flex flex-wrap gap-1">
                      {aliases.slice(0, 3).map((alias, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">{alias.trim()}</span>
                      ))}
                      {aliases.length > 3 && <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">+{aliases.length - 3}</span>}
                    </div>
                  );
                }
              },
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
              { name: 'aliases', label: 'Aliases (comma separated)' },
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
            formFields={[
              { name: 'title', label: 'Title', required: true },
              { name: 'tutor_id', label: 'Tutor', type: 'user-search', required: true },
              { name: 'subject', label: 'Subject', required: true },
              { name: 'description', label: 'Description', type: 'textarea' },
              { name: 'fee_details', label: 'Fee Details' },
              { name: 'is_active', label: 'Active', type: 'checkbox' }
            ]}
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
            formFields={[
              { name: 'title', label: 'Title' },
              { name: 'description', label: 'Description', type: 'textarea', required: true },
              { name: 'subjects', label: 'Subjects (comma separated)', required: true },
              { name: 'student_id', label: 'Student', type: 'user-search', required: true },
              { name: 'service_type', label: 'Service Type', type: 'select', options: [
                {value: 'Tutoring', label: 'Tutoring'},
                {value: 'Assignment Help', label: 'Assignment Help'}
              ]},
              { name: 'status', label: 'Status', type: 'select', options: [
                {value: 'Open', label: 'Open'},
                {value: 'Assigned', label: 'Assigned'},
                {value: 'Completed', label: 'Completed'},
                {value: 'Cancelled', label: 'Cancelled'}
              ]}
            ]}
          />
        );

      case 'questions':
        return (
          <ResourceManager
            resourceName="Question"
            apiEndpoint="/api/admin/questions/"
            columns={[
              {
                header: 'Question',
                render: q => (
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{q.title}</div>
                    {q.is_flagged && <div className="text-xs text-red-600 mt-1">⚠ {q.flagged_reason}</div>}
                  </div>
                )
              },
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
              },
              { header: 'Answers', render: q => <span className="text-sm text-gray-600">{q.answers_count || 0}</span> }
            ]}
            formFields={[
              { name: 'title', label: 'Title', required: true },
              { name: 'content', label: 'Content', type: 'textarea', required: true },
              { name: 'student_id', label: 'Student', type: 'user-search', required: true }
            ]}
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
          <div className="space-y-6">
            {/* Flagged Questions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Flagged Questions</h2>
              <ResourceManager
                resourceName="Question"
                apiEndpoint="/api/admin/questions/?approval_status=pending"
                columns={[
                  { header: 'Title', render: q => <span className="font-medium text-gray-900 text-sm">{q.title}</span> },
                  { header: 'Reason', render: q => <span className="text-xs text-red-600">{q.flagged_reason}</span> },
                  { header: 'Student', render: q => <span className="text-sm text-gray-600">{q.student?.username}</span> }
                ]}
                formFields={[]}
                canCreate={false}
                canEdit={false}
                customActions={(item, onUpdate) => (
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
              />
            </div>

            {/* Tutor Applications */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Tutor Applications</h2>
              <ResourceManager
                resourceName="Application"
                apiEndpoint="/api/admin/tutor-applications/?status=pending"
                columns={[
                  { header: 'Student', render: app => <span className="font-medium text-gray-900 text-sm">{app.student?.username}</span> },
                  { header: 'Reason', render: app => <span className="text-sm text-gray-600 line-clamp-2">{app.reason}</span> },
                  { header: 'Date', render: app => <span className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString()}</span> }
                ]}
                formFields={[]}
                canCreate={false}
                canEdit={false}
                customActions={(item, onUpdate) => (
                  item.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await apiService.post(`/api/admin/tutor-applications/${item.id}/approve/`);
                          onUpdate();
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          const notes = prompt('Rejection reason:');
                          await apiService.post(`/api/admin/tutor-applications/${item.id}/reject/`, { review_notes: notes || '' });
                          onUpdate();
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )
                )}
              />
            </div>

            {/* Abuse Reports */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Abuse Reports</h2>
              <ResourceManager
                resourceName="Report"
                apiEndpoint="/api/admin/reports/"
                columns={[
                  { header: 'User', render: r => <span className="font-medium text-gray-900 text-sm">{r.reported_user_id}</span> },
                  { header: 'Reason', render: r => <span className="text-sm text-gray-600">{r.reason}</span> },
                  { header: 'Type', render: r => <span className="text-xs text-gray-500">{r.target_type}</span> }
                ]}
                formFields={[]}
              />
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-4">
            {(user?.user_type === 'admin' || user?.user_type === 'moderator') && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  <Download className="w-4 h-4" />
                  Download Statement
                </button>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Transactions</h2>
              <ResourceManager
                resourceName="Payment"
                apiEndpoint="/api/admin/payments/"
                columns={[
                  { header: 'Transaction ID', render: p => <span className="font-mono text-xs text-gray-600">{p.transaction_id?.substring(0, 12)}...</span> },
                  { header: 'User', render: p => <span className="text-sm text-gray-900">{p.order_user?.username || 'Guest'}</span> },
                  { header: 'Amount', render: p => <span className="font-medium text-gray-900">৳{p.amount}</span> },
                  {
                    header: 'Status',
                    render: p => (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        p.status === 'SUCCESS' ? 'text-green-700 bg-green-50' :
                        p.status === 'PENDING' ? 'text-yellow-700 bg-yellow-50' :
                        'text-red-700 bg-red-50'
                      }`}>
                        {p.status}
                      </span>
                    )
                  }
                ]}
                formFields={[]}
                canCreate={false}
                canEdit={false}
                canDelete={false}
              />
            </div>
          </div>
        );

      case 'packages':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Point Packages</h2>
            <ResourceManager
              resourceName="Package"
              apiEndpoint="/api/admin/point-packages/"
              columns={[
                { header: 'Name', render: p => <span className="font-medium text-gray-900 text-sm">{p.name}</span> },
                { header: 'Points', render: p => <span className="font-medium text-gray-900">{p.points}</span> },
                { header: 'Price', render: p => <span className="font-medium text-gray-900">৳{p.price}</span> },
                {
                  header: 'Discount',
                  render: p => p.discount_percentage > 0 ? (
                    <span className="text-xs text-orange-600">{p.discount_percentage}% OFF</span>
                  ) : (
                    <span className="text-xs text-gray-400">None</span>
                  )
                },
                {
                  header: 'Status',
                  render: p => (
                    <span className={`px-2 py-1 text-xs font-medium rounded ${p.is_active ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-100'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )
                }
              ]}
              formFields={[
                { name: 'name', label: 'Package Name', required: true },
                { name: 'points', label: 'Points', type: 'number', required: true },
                { name: 'price', label: 'Price (BDT)', type: 'number', required: true },
                { name: 'discount_percentage', label: 'Discount %', type: 'number' },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'is_active', label: 'Active', type: 'checkbox' }
              ]}
            />
          </div>
        );

      case 'coupons':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Discount Coupons</h2>
            <ResourceManager
              resourceName="Coupon"
              apiEndpoint="/api/admin/coupons/"
              columns={[
                { header: 'Code', render: c => <span className="font-mono font-medium text-gray-900 text-sm">{c.code}</span> },
                { header: 'Discount', render: c => <span className="font-medium text-gray-900">{c.discount_percentage}%</span> },
                {
                  header: 'Status',
                  render: c => (
                    <span className={`px-2 py-1 text-xs font-medium rounded ${c.active ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-100'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  )
                },
                { header: 'Valid From', render: c => <span className="text-xs text-gray-500">{c.valid_from ? new Date(c.valid_from).toLocaleDateString() : 'N/A'}</span> },
                { header: 'Valid To', render: c => <span className="text-xs text-gray-500">{c.valid_to ? new Date(c.valid_to).toLocaleDateString() : 'N/A'}</span> }
              ]}
              formFields={[
                { name: 'code', label: 'Coupon Code', required: true },
                { name: 'discount_percentage', label: 'Discount % (0-100)', type: 'number', required: true },
                { name: 'active', label: 'Active', type: 'checkbox' },
                { name: 'valid_from', label: 'Valid From', type: 'datetime-local' },
                { name: 'valid_to', label: 'Valid To', type: 'datetime-local' }
              ]}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Mobile Tab Navigation */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Admin Panel</div>
              <div className="text-xs text-indigo-600">{user?.username}</div>
            </div>
          </div>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)] pt-[88px] md:pt-0">
        {/* Minimal Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Admin Panel</div>
                <div className="text-xs text-indigo-600">{user?.username}</div>
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
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}

        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 pt-16 md:pt-16">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 capitalize">{activeTab}</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage {activeTab}</p>
                </div>
                <button
                  onClick={fetchDashboardStats}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
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

      <PaymentStatementDownloader
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
};

// Minimal Stat Card with Color
const StatCard = ({ title, value, icon: Icon }) => {
  const iconColors = {
    'Total Users': 'text-blue-500 bg-blue-50',
    'Total Revenue': 'text-green-500 bg-green-50',
    'Active Jobs': 'text-purple-500 bg-purple-50',
    'Pending Items': 'text-orange-500 bg-orange-50',
    'Total Questions': 'text-indigo-500 bg-indigo-50',
    'Total Gigs': 'text-cyan-500 bg-cyan-50',
    'Total Packages': 'text-pink-500 bg-pink-50',
    'Active Coupons': 'text-amber-500 bg-amber-50',
    'Pending Questions': 'text-yellow-500 bg-yellow-50',
    'Pending Reports': 'text-red-500 bg-red-50',
  };

  const colorClass = iconColors[title] || 'text-gray-500 bg-gray-50';

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

  // Color coding for different types
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
    if (label.includes('In Progress') || label.includes('Assigned')) {
      return 'bg-gradient-to-r from-purple-500 to-indigo-500';
    }
    // Default colors for user types
    if (label === 'Students') return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (label === 'Tutors') return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (label === 'Moderators') return 'bg-gradient-to-r from-orange-500 to-amber-500';
    if (label === 'Admins') return 'bg-gradient-to-r from-red-500 to-rose-500';

    return 'bg-gradient-to-r from-indigo-500 to-blue-500';
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

export default AdminDashboard;
