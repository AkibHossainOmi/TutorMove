import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, icon, color, trend }) => {
  const bgColors = {
    blue: 'bg-blue-50',
    emerald: 'bg-emerald-50',
    indigo: 'bg-indigo-50',
    violet: 'bg-violet-50'
  };

  const textColors = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    indigo: 'text-indigo-600',
    violet: 'text-violet-600'
  };

  return (
    <div className="bg-white overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-xl p-3 ${bgColors[color]}`}>
            {React.cloneElement(icon, { className: `h-6 w-6 ${textColors[color]}` })}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  {trend && (
                     <span className={`ml-2 flex items-baseline text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                     </span>
                  )}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['blue', 'emerald', 'indigo', 'violet']).isRequired,
  trend: PropTypes.number
};

const DashboardStats = ({ stats, favoriteTeachersCount }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
      <StatCard
        title="Available Points"
        value={stats.creditBalance}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="emerald"
      />
      <StatCard
        title="Active Jobs"
        value={stats.activeJobs}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        color="indigo"
      />
      <StatCard
        title="Favorite Teachers"
        value={favoriteTeachersCount}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
        color="violet"
      />
    </div>
  );
};

DashboardStats.propTypes = {
  stats: PropTypes.shape({
    creditBalance: PropTypes.number,
    activeJobs: PropTypes.number,
    completedJobs: PropTypes.number,
  }).isRequired,
  favoriteTeachersCount: PropTypes.number.isRequired,
};

export default DashboardStats;