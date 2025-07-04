import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-3 text-white`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'emerald', 'amber', 'violet']).isRequired,
};

const DashboardStats = ({ stats, favoriteTeachersCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Available Credits"
        value={stats.creditBalance}
        icon="💰"
        color="emerald"
      />
      <StatCard
        title="Active Jobs"
        value={stats.activeJobs}
        icon="📝"
        color="blue"
      />
      <StatCard
        title="Completed Jobs"
        value={stats.completedJobs}
        icon="✅"
        color="violet"
      />
      <StatCard
        title="Favorite Tutors"
        value={favoriteTeachersCount}
        icon="❤️"
        color="amber"
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