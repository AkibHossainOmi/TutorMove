import React from 'react';

const GigItemCard = ({ gig }) => {
  const { title, description, subject, created_at, status } = gig;

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    completed: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-lg font-semibold text-gray-900 line-clamp-2">{title || 'No Title'}</h4>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
            {status || 'Active'}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description || 'No description provided.'}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-gray-50 px-2 py-1 rounded-md font-medium text-gray-700">
            Subject: {subject || 'N/A'}
          </span>
          <span className="bg-gray-50 px-2 py-1 rounded-md font-medium text-gray-700">
            Created: {created_at ? new Date(created_at).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

export default GigItemCard;