import React from 'react';
import { FaKey, FaTrash } from 'react-icons/fa';
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

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await userApi.deleteAccount();
      alert("Your account has been deleted.");
      // Optionally, log out the user and redirect
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      alert("Failed to delete account: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
        <FaKey className="text-indigo-500 mr-2" /> Account Actions
      </h2>
      <div className="space-y-4">
        {/* Change Password */}
        <button
          onClick={() => setShowPasswordFields((prev) => !prev)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handlePasswordChange}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Update Password
            </button>
          </div>
        )}

        {/* Delete Account */}
        <button
          onClick={handleDeleteAccount}
          className="w-full px-4 py-2 mt-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
        >
          <FaTrash /> Delete Account
        </button>
      </div>
    </div>
  );
};

export default AccountActionsCard;
