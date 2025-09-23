import React from 'react';

export default function UnlockJobModal({ show, studentId, onClose, onJobUnlocked }) {
  if (!show) return null;

  const handleGoToJob = () => {
    // Redirect tutor to the job unlock page for that student
    window.location.href = `/jobs`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
        <h3 className="text-lg font-semibold mb-4">Unlock Contact</h3>
        <p className="mb-4">
          You need to unlock a job related to this student before you can unlock the contact.
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={handleGoToJob}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Go to Jobs
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
