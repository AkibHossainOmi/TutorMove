import React from 'react';

const StatusMessage = ({ profile }) => {
  const { updateStatus, passwordStatus } = profile;

  const messages = [
    updateStatus,
    passwordStatus,
  ].filter(m => m?.message); // only messages with content
console.log(messages);

  if (messages.length === 0) return null;

  return (
    <>
      {messages.map((m, idx) => (
        <div
          key={idx}
          className={`mt-4 p-4 rounded-lg shadow-md text-center ${
            m.type === 'error'
              ? 'bg-red-100 text-red-700'
              : m.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {m.message}
        </div>
      ))}
    </>
  );
};

export default StatusMessage;
