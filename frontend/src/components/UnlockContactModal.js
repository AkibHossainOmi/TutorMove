// UnlockContactModal.js
import React, { useState } from 'react';
import { contactUnlockAPI } from '../utils/apiService';

const UnlockContactModal = ({ show, onClose, tutorId, onUnlockSuccess, onNeedBuyCredits }) => {
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleUnlockClick = async () => {
    setUnlocking(true);
    setError('');
    try {
      const res = await contactUnlockAPI.unlockContact(tutorId);

      if (res && (res.status === 201 || res.status === 200)) {
        onUnlockSuccess?.(res.data || {});
        onClose();
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        err.message ||
        'Failed to unlock contact info.';

      setError(msg);

      if (msg.toLowerCase().includes('point') || err.response?.status === 402) {
        onNeedBuyCredits?.(); // delegate to parent
      }
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Unlock Contact Info</h3>
        <p className="mb-4 text-gray-700 text-sm leading-6">
          Use <strong>1 point</strong> to unlock the tutor's contact info
          <br />
          and start a conversation instantly.
        </p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            disabled={unlocking}
          >
            Cancel
          </button>
          <button
            onClick={handleUnlockClick}
            disabled={unlocking}
            className={`px-4 py-2 rounded text-white font-medium ${
              unlocking ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {unlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockContactModal;
