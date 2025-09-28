import React from 'react';
import PropTypes from 'prop-types';
import JobCard from '../../JobCard';

const JobsTab = ({ postedJobs, onPostJobClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Your Job Posts</h3>
        <button
          onClick={onPostJobClick}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Post New Job
        </button>
      </div>

      {postedJobs.length > 0 ? (
        <div className="space-y-4">
          {postedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by posting your first job.</p>
          <div className="mt-6">
            <button
              onClick={onPostJobClick}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Post New Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

JobsTab.propTypes = {
  postedJobs: PropTypes.array.isRequired,
  onPostJobClick: PropTypes.func.isRequired,
};

const TutorsTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recommended Tutors</h3>
        <button
          onClick={() => window.location.href = '/tutors'}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Browse All Tutors
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Find your perfect tutor</h3>
        <p className="mt-1 text-sm text-gray-500">Browse our verified tutors to find your perfect match.</p>
        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/tutors'}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Tutors
          </button>
        </div>
      </div>
    </div>
  );
};

const PremiumTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-8 text-center border border-yellow-200">
        <h3 className="text-xl font-bold text-yellow-600 mb-4">Unlock Premium Features 🚀</h3>
        <p className="text-gray-700 mb-6">
          Upgrade to Student Premium for exclusive benefits that enhance your learning experience.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-yellow-500 text-2xl mb-3">✨</div>
            <h4 className="font-semibold text-gray-900 mb-2">Priority Matching</h4>
            <p className="text-gray-600 text-sm">Get your job posts seen by top tutors first</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-yellow-500 text-2xl mb-3">📞</div>
            <h4 className="font-semibold text-gray-900 mb-2">Direct Support</h4>
            <p className="text-gray-600 text-sm">24/7 access to our support team</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-yellow-500 text-2xl mb-3">🎁</div>
            <h4 className="font-semibold text-gray-900 mb-2">Exclusive Discounts</h4>
            <p className="text-gray-600 text-sm">Save on points and premium features</p>
          </div>
        </div>

        <button
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded-lg hover:shadow-lg transition-all font-bold shadow-md"
        >
          Upgrade Now - $9.99/month
        </button>
      </div>
    </div>
  );
};

const DashboardTabs = ({ activeTab, onTabChange, postedJobs, onPostJobClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {['jobs', 'tutors', 'premium'].map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'jobs' && <JobsTab postedJobs={postedJobs} onPostJobClick={onPostJobClick} />}
        {activeTab === 'tutors' && <TutorsTab />}
        {activeTab === 'premium' && <PremiumTab />}
      </div>
    </div>
  );
};

DashboardTabs.propTypes = {
  activeTab: PropTypes.oneOf(['jobs', 'tutors', 'premium']).isRequired,
  onTabChange: PropTypes.func.isRequired,
  postedJobs: PropTypes.array.isRequired,
  onPostJobClick: PropTypes.func.isRequired,
};

export default DashboardTabs;