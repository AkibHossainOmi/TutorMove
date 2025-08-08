import React from 'react';
import { useNavigate } from 'react-router-dom';

const GigItemCard = ({ gig }) => {
  const { id, title, education, experience, created_at } = gig;
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/tutor/gig/${id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      <div className="p-5">
        <h4 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
          {title || 'No Title'}
        </h4>

        {/* <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description || 'No description provided.'}
        </p> */}

        <div className="text-xs text-gray-700 space-y-1 mb-4">
          <div>
            <span className="font-medium">Education:</span> {education || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Experience:</span> {experience || 'N/A'}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Posted on {created_at ? new Date(created_at).toLocaleDateString() : 'N/A'}
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
        <button
         onClick={handleViewDetails}
         className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

export default GigItemCard;
