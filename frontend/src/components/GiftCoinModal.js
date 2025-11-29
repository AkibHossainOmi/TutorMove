import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const GiftCoinModal = ({ isOpen, onClose, tutorId, tutorName, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGift = async () => {
    setError(null);
    setSuccess(false);

    if (!amount || parseInt(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (parseInt(amount) > currentBalance) {
        setError("Insufficient balance.");
        return;
    }

    setLoading(true);
    try {
      await axios.post('/api/gifts/', {
        recipient: tutorId,
        amount: parseInt(amount)
      }, {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth implementation
          }
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setAmount('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send gift. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Gift Coins to {tutorName}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Your current balance: <span className="font-semibold text-indigo-600">{currentBalance} coins</span>
                  </p>
                  <div className="mt-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="mt-2 text-sm text-green-600">
                      Successfully gifted!
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
                    onClick={handleGift}
                    disabled={loading || success}
                  >
                    {loading ? 'Sending...' : 'Gift Coin'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GiftCoinModal;
