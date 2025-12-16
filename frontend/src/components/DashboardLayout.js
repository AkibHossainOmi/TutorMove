import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Removed Navbar import to avoid duplication with MainLayout

const DashboardLayout = ({ title, user, tabs, activeTab, setActiveTab, children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Secondary Dashboard Navigation (Sticky below Main Navbar) */}
      {/* Note: Main Navbar is fixed (h-16), so we stick top-16 */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm w-full">
        <div className="container-custom">
          <div className="flex items-center justify-between h-14">
            {/* Dashboard Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200
                      ${isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full mx-3" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* User / Actions (Desktop only) */}
            <div className="hidden md:flex items-center gap-4">
               <span className="text-sm text-slate-500">
                  Welcome back, <span className="font-semibold text-slate-800">{user?.first_name || user?.username}</span>
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {/* Removed padding-top here because MainLayout handles the main navbar offset, 
          and this component just flows in the outlet. */}
      <div className="flex-1 w-full py-8 container-custom">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;