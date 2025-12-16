import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaSearch, FaCheck } from 'react-icons/fa';
import apiService from '../utils/apiService';

const DynamicForm = ({ fields, initialValues, onSubmit, onCancel, title }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({});
  const [searching, setSearching] = useState({});

  useEffect(() => {
    if (initialValues) {
      // Pre-fill form data
      const data = {};
      fields.forEach(field => {
        // Support valueKey to map from a different key in initialValues
        const valueKey = field.valueKey || field.name;
        if (field.type === 'user-search') {
           // For user search fields, we might need to handle object vs ID
           // If initialValues has an object (e.g. {id: 1, username: 'user'}), use ID
           // If it's just an ID, use it.
           // However, for display, we might need the username.
           // This simple implementation assumes we just hold the ID in formData.
           // A more complex one would fetch the user details to show the name.
           const val = initialValues[valueKey];
           data[field.name] = (typeof val === 'object' && val !== null) ? val.id : val;
        } else {
           data[field.name] = initialValues[valueKey];
        }
      });
      setFormData(data);
    }
  }, [initialValues, fields]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSearch = async (fieldName, query) => {
    if (!query || query.length < 2) {
      setSearchResults(prev => ({ ...prev, [fieldName]: [] }));
      return;
    }

    setSearching(prev => ({ ...prev, [fieldName]: true }));
    try {
      // Adjust endpoint as needed
      const res = await apiService.get(`/api/users/search/?q=${query}`);
      setSearchResults(prev => ({ ...prev, [fieldName]: res.data }));
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">{title || 'Form'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                rows={4}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            ) : field.type === 'select' ? (
              <div className="relative">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={field.name}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={!!formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                />
                <label htmlFor={field.name} className="text-sm text-gray-600 cursor-pointer select-none">
                  {field.label}
                </label>
              </div>
            ) : field.type === 'user-search' ? (
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Search user..."
                    onChange={(e) => handleUserSearch(field.name, e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {searching[field.name] && (
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin">⟳</div>
                  )}
                </div>
                {/* Selected Value Display */}
                {formData[field.name] && (
                   <div className="mt-2 text-sm text-green-600 flex items-center gap-1 font-medium bg-green-50 px-3 py-1 rounded w-fit">
                      <FaCheck /> ID Selected: {formData[field.name]}
                   </div>
                )}
                {/* Search Results Dropdown */}
                {searchResults[field.name] && searchResults[field.name].length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults[field.name].map(user => (
                      <div
                        key={user.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          handleChange(field.name, user.id);
                          setSearchResults(prev => ({ ...prev, [field.name]: [] }));
                        }}
                      >
                        <span className="font-medium">{user.username}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <input
                type={field.type || 'text'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
          </div>
        ))}

        <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all flex items-center gap-2
              ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow'}`}
          >
            {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
