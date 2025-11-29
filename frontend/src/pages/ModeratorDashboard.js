import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ModeratorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user && user.user_type !== 'moderator' && user.user_type !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Moderator Dashboard</h1>
                    <p className="text-gray-600">
                        Welcome to the Moderator Dashboard. Features for content moderation will appear here.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                            <h2 className="text-xl font-semibold mb-2">Pending Reports</h2>
                            <p className="text-gray-500">0 reports pending review.</p>
                         </div>
                         <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                            <h2 className="text-xl font-semibold mb-2">Flagged Content</h2>
                            <p className="text-gray-500">0 items flagged.</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeratorDashboard;
