import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Users, Briefcase, DollarSign, Activity, Shield,
  FileText, AlertTriangle, Flag, BookOpen
} from 'lucide-react';
import { ResourceManager, OverviewStats } from '../components/DashboardComponents';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // If auth is still loading, user might be null, but we usually handle that in UseAuth or protected route
    // Assuming simple check here
    if (user && user.user_type !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'gigs', label: 'Gigs', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'questions', label: 'Questions', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'payments', label: 'Payments', icon: DollarSign },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewStats />;
      case 'users':
        return <ResourceManager
          resourceName="User"
          apiEndpoint="/api/admin/users/"
          columns={[
             { header: 'User', render: u => <div><div className="font-bold">{u.username}</div><div className="text-xs text-gray-500">{u.email}</div></div> },
             { header: 'Role', accessor: 'user_type' },
             { header: 'Credits', render: u => ['admin', 'moderator'].includes(u.user_type) ? 'N/A' : u.credit_balance },
             { header: 'Status', render: u => <span className={`px-2 py-0.5 rounded-full text-xs ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100'}`}>{u.is_active ? 'Active' : 'Blocked'}</span> }
          ]}
          formFields={[
             { name: 'username', label: 'Username', required: true },
             { name: 'email', label: 'Email', type: 'email', required: true },
             { name: 'first_name', label: 'First Name' },
             { name: 'last_name', label: 'Last Name' },
             { name: 'user_type', label: 'Role', type: 'select', options: [{value: 'student', label: 'Student'}, {value: 'tutor', label: 'Tutor'}, {value: 'admin', label: 'Admin'}, {value: 'moderator', label: 'Moderator'}], required: true },
             { name: 'credit_balance', label: 'Credit Balance (Student/Tutor only)', type: 'number', required: true },
             { name: 'is_active', label: 'Active Account', type: 'checkbox' },
             { name: 'password', label: 'Password (Leave blank to keep current)', type: 'password' }
          ]}
        />;
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
        />;
      case 'gigs':
        return <ResourceManager
          resourceName="Gig"
          apiEndpoint="/api/admin/gigs/"
          columns={[
             { header: 'Title', accessor: 'title' },
             { header: 'Tutor', accessor: 'tutor' },
             { header: 'Subject', accessor: 'subject' },
             { header: 'Status', render: g => <span className={`px-2 py-0.5 rounded-full text-xs ${g.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{g.is_active ? 'Active' : 'Inactive'}</span> }
          ]}
          formFields={[
             { name: 'title', label: 'Title', required: true },
             { name: 'tutor_id', label: 'Tutor', type: 'user-search', required: true },
             { name: 'subject', label: 'Subject Name', required: true },
             { name: 'description', label: 'Description', type: 'textarea' },
             { name: 'fee_details', label: 'Fee Details' },
             { name: 'is_active', label: 'Is Active', type: 'checkbox' },
          ]}
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
             { header: 'Status', render: j => <span className={`px-2 py-0.5 rounded-full text-xs ${j.status === 'Open' ? 'bg-green-100' : 'bg-gray-100'}`}>{j.status}</span> },
          ]}
          formFields={[
             { name: 'title', label: 'Title (Optional)' },
             { name: 'description', label: 'Description', type: 'textarea', required: true },
             { name: 'subjects', label: 'Subjects (comma separated)', required: true },
             { name: 'student_id', label: 'Student', type: 'user-search', required: true },
             { name: 'service_type', label: 'Service Type', type: 'select', options: [{value: 'Tutoring', label: 'Tutoring'}, {value: 'Assignment Help', label: 'Assignment Help'}] },
             { name: 'status', label: 'Status', type: 'select', options: [{value: 'Open', label: 'Open'}, {value: 'Assigned', label: 'Assigned'}, {value: 'Completed', label: 'Completed'}, {value: 'Cancelled', label: 'Cancelled'}] },
             { name: 'budget', label: 'Budget', type: 'number' },
          ]}
        />;
      case 'questions':
        return <ResourceManager
          resourceName="Question"
          apiEndpoint="/api/admin/questions/"
          columns={[
             { header: 'Title', accessor: 'title' },
             { header: 'Student', render: q => q.student ? q.student.username : 'N/A' },
             { header: 'Answers', accessor: 'answers_count' },
          ]}
          formFields={[
             { name: 'title', label: 'Title', required: true },
             { name: 'content', label: 'Content', type: 'textarea', required: true },
             { name: 'student_id', label: 'Student', type: 'user-search', required: true },
          ]}
        />;
       case 'reports':
        return <ResourceManager
            resourceName="Report"
            apiEndpoint="/api/admin/reports/"
            columns={[
                { header: 'Reported User', render: r => r.reported_user_id || 'N/A' },
                { header: 'Reason', accessor: 'reason' },
                { header: 'Type', accessor: 'target_type' },
                { header: 'Date', render: r => new Date(r.created_at).toLocaleDateString() }
            ]}
            formFields={[]} // Read-only typically, or maybe minimal edit
        />;
       case 'payments':
        return <ResourceManager
          resourceName="Payment"
          apiEndpoint="/api/admin/payments/"
          columns={[
             { header: 'Trx ID', accessor: 'transaction_id' },
             { header: 'User', render: p => p.order?.user || 'Guest' },
             { header: 'Amount', accessor: 'amount' },
             { header: 'Status', accessor: 'status' },
          ]}
          formFields={[]} // Read-only typically
        />;
      default: return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg hidden md:block z-10 overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-indigo-700 flex items-center"><Shield className="mr-2" /> Admin</h2>
          </div>
          <nav className="p-4 space-y-2">
            {tabs.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <item.icon size={20} className="mr-3" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
           <header className="mb-6">
             <h1 className="text-3xl font-bold text-gray-800 capitalize">{activeTab}</h1>
           </header>
           {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
