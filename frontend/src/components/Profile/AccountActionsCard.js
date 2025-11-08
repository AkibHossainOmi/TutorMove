import React, { useState } from 'react';
import { FaKey, FaTrash, FaExclamationTriangle, FaTimes, FaLock } from 'react-icons/fa';
import { userApi } from '../../utils/apiService';

const AccountActionsCard = ({ profile }) => {
  const {
    showPasswordFields,
    setShowPasswordFields,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handlePasswordChange,
  } = profile;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyPassword = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password');
      return;
    }

    setIsVerifying(true);
    setDeleteError('');

    try {
      // Verify password by attempting to change it to itself
      // Or you can create a dedicated verify endpoint in your API
      await userApi.verifyPassword({ password: deletePassword });
      setPasswordVerified(true);
      setDeleteError('');
    } catch (err) {
      setDeleteError('Incorrect password. Please try again.');
      setPasswordVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await userApi.deleteAccount();
      // Success - clear storage and redirect
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setPasswordVerified(false);
    setDeleteError('');
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
          <FaKey className="text-indigo-500 mr-2" /> Account Actions
        </h2>
        <div className="space-y-4">
          {/* Change Password */}
          <button
            onClick={() => setShowPasswordFields((prev) => !prev)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between transition-colors"
          >
            Change Password <FaKey />
          </button>
          {showPasswordFields && (
            <div className="space-y-3 mt-3">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handlePasswordChange}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          )}

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-2 mt-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
          >
            <FaTrash /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <FaExclamationTriangle className="text-red-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Delete Account
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={isDeleting || isVerifying}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              {!passwordVerified ? (
                // Password Verification Step
                <>
                  <p className="text-gray-700 mb-4">
                    To delete your account, please verify your identity by entering your password.
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaLock className="inline mr-2 text-gray-500" />
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeleteError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      disabled={isVerifying}
                      autoFocus
                    />
                  </div>

                  {deleteError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800">{deleteError}</p>
                    </div>
                  )}
                </>
              ) : (
                // Account Deletion Confirmation Step
                <>
                  <div className="flex items-center gap-2 mb-4 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Password verified</span>
                  </div>

                  <p className="text-gray-700 mb-4">
                    Are you sure you want to delete your account? This action is{' '}
                    <span className="font-semibold text-red-600">permanent</span> and cannot be undone.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> All your data, settings, and information will be permanently removed.
                    </p>
                  </div>

                  {deleteError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800">{deleteError}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={isDeleting || isVerifying}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              {!passwordVerified ? (
                <button
                  onClick={handleVerifyPassword}
                  disabled={isVerifying || !deletePassword.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FaLock />
                      Verify Password
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete My Account
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default AccountActionsCard;