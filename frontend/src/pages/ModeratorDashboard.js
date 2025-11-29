import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Briefcase, Activity, Shield,
  FileText, AlertTriangle, BookOpen
} from 'lucide-react';
import { ResourceManager, OverviewStats } from '../components/DashboardComponents';

const ModeratorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (user && user.user_type !== 'moderator' && user.user_type !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'gigs', label: 'Gigs', icon: FileText },
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
        { id: 'questions', label: 'Questions', icon: AlertTriangle },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewStats />;
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
                    ]}
                    formFields={[]} // View only
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
                        { header: 'Status', render: j => <span className={`px-2 py-0.5 rounded-full text-xs ${j.status === 'Open' ? 'bg-green-100' : 'bg-gray-100'}`}>{j.status}</span> },
                    ]}
                    formFields={[]} // View only
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
                        { header: 'Answers', accessor: 'answers_count' },
                    ]}
                    formFields={[]} // View only
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
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-lg hidden md:block z-10 overflow-y-auto">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-indigo-700 flex items-center"><Shield className="mr-2" /> Moderator</h2>
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

export default ModeratorDashboard;
