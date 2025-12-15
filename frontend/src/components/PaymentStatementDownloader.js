import React, { useState, useEffect } from 'react';
import { Download, X, Calendar } from 'lucide-react';
import { startOfToday, startOfMonth, endOfMonth, subDays, subMonths, format } from 'date-fns';
import { downloadPaymentStatement } from '../utils/downloadHelper';
import apiService from '../utils/apiService';

const PaymentStatementDownloader = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('custom');

  // Date presets
  const presets = [
    {
      id: 'today',
      label: 'Today',
      getRange: () => {
        const today = startOfToday();
        return {
          start: format(today, "yyyy-MM-dd'T'HH:mm"),
          end: format(new Date(), "yyyy-MM-dd'T'HH:mm")
        };
      }
    },
    {
      id: 'last7days',
      label: 'Last 7 Days',
      getRange: () => {
        const end = new Date();
        const start = subDays(end, 7);
        return {
          start: format(start, "yyyy-MM-dd'T'HH:mm"),
          end: format(end, "yyyy-MM-dd'T'HH:mm")
        };
      }
    },
    {
      id: 'last30days',
      label: 'Last 30 Days',
      getRange: () => {
        const end = new Date();
        const start = subDays(end, 30);
        return {
          start: format(start, "yyyy-MM-dd'T'HH:mm"),
          end: format(end, "yyyy-MM-dd'T'HH:mm")
        };
      }
    },
    {
      id: 'thismonth',
      label: 'This Month',
      getRange: () => {
        const now = new Date();
        return {
          start: format(startOfMonth(now), "yyyy-MM-dd'T'HH:mm"),
          end: format(endOfMonth(now), "yyyy-MM-dd'T'HH:mm")
        };
      }
    },
    {
      id: 'lastmonth',
      label: 'Last Month',
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          start: format(startOfMonth(lastMonth), "yyyy-MM-dd'T'HH:mm"),
          end: format(endOfMonth(lastMonth), "yyyy-MM-dd'T'HH:mm")
        };
      }
    },
    {
      id: 'custom',
      label: 'Custom',
      getRange: () => ({ start: '', end: '' })
    }
  ];

  // Fetch preview stats when dates change
  useEffect(() => {
    const fetchPreview = async () => {
      if (startDate && endDate) {
        try {
          const response = await apiService.get('/api/admin/payments/', {
            params: {
              start_date: startDate,
              end_date: endDate
            }
          });

          const payments = response.data.results || response.data;
          const stats = {
            total: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
            success: payments.filter(p => p.status === 'SUCCESS').length,
            pending: payments.filter(p => p.status === 'PENDING').length,
            failed: payments.filter(p => p.status === 'FAILED').length
          };

          setPreview(stats);
        } catch (err) {
          console.error('Error fetching preview:', err);
          setPreview(null);
        }
      }
    };

    const timer = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset.id);
    const range = preset.getRange();
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const handleDownload = async () => {
    setError('');

    // Validation
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date.');
      return;
    }

    setLoading(true);

    try {
      await downloadPaymentStatement(startDate, endDate, status);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Download Payment Statement</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Range Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPreset === preset.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date & Time
                </div>
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedPreset('custom');
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date & Time
                </div>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedPreset('custom');
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="all">All Payments</option>
              <option value="SUCCESS">Successful Only</option>
              <option value="PENDING">Pending Only</option>
              <option value="FAILED">Failed Only</option>
            </select>
          </div>

          {/* Preview Stats */}
          {preview && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-5 border border-indigo-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Statement Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Total Transactions</div>
                  <div className="text-2xl font-bold text-gray-800">{preview.total}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {preview.totalAmount.toLocaleString()} BDT
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm md:col-span-1 col-span-2">
                  <div className="text-xs text-gray-500 mb-1">By Status</div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-green-600 font-semibold">✓ {preview.success}</span>
                    <span className="text-yellow-600 font-semibold">⏱ {preview.pending}</span>
                    <span className="text-red-600 font-semibold">✗ {preview.failed}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <div className="text-red-600 font-semibold text-sm">⚠</div>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || !startDate || !endDate}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Statement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatementDownloader;
