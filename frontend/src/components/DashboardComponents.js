import React, { useEffect, useState } from 'react';
import apiService from '../utils/apiService';
import {
  Search, Edit2, Trash2, Plus, Save, X, Activity
} from 'lucide-react';

// --- Generic Components ---

export const StatBadge = ({ label, value, color = 'blue' }) => (
  <div className={`bg-${color}-100 text-${color}-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2`}>
    {label}: {value}
  </div>
);

export const ActionButton = ({ onClick, icon: Icon, color, title }) => (
  <button onClick={onClick} title={title} className={`p-1 rounded hover:bg-gray-200 ${color} mr-1`}>
    <Icon size={18} />
  </button>
);

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold capitalize">{title}</h3>
          <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-gray-700" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export const DynamicForm = ({ fields, initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      {fields.map(field => (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
            {field.label || field.name.replace(/_/g, ' ')}
          </label>
          {field.type === 'select' ? (
            <select
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
             <textarea
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              required={field.required}
            />
          ) : field.type === 'checkbox' ? (
             <input
              type="checkbox"
              name={field.name}
              checked={formData[field.name] || false}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          ) : (
            <input
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
              required={field.required}
              step={field.step}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end space-x-2 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center">
            <Save size={16} className="mr-2" /> Save
        </button>
      </div>
    </form>
  );
};

// --- Resource Manager Component ---

export const ResourceManager = ({
  resourceName,
  apiEndpoint,
  columns,
  formFields,
  statsConfig = [],
  customActions = null,
  canEdit = true,
  canDelete = true,
  canCreate = true
}) => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const getApiUrl = (endpoint) => {
    const baseUrl = process.env.REACT_APP_API_URL || '';
    // ensure no double slashes if base ends with / and endpoint starts with /
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBase}${cleanEndpoint}`;
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Use apiService which handles token injection and refresh
      const url = getApiUrl(apiEndpoint);

      // Attempt to fetch stats if supported (ignore 404 on stats)
      let statsData = {};
      try {
          const statsRes = await apiService.get(`${url}stats/`);
          statsData = statsRes.data;
      } catch (e) {
          // ignore stats error
          console.warn('Stats fetch failed or not supported', e);
      }

      const dataRes = await apiService.get(url);

      setData(dataRes.data.results || dataRes.data);
      setStats(statsData);
    } catch (error) {
      console.error(`Error fetching ${resourceName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [resourceName]); // Reload when resource changes

  const handleDelete = async (id) => {
    if (!canDelete) return;
    if (!window.confirm("Delete this item?")) return;
    try {
      await apiService.delete(`${getApiUrl(apiEndpoint)}${id}/`);
      fetchAll();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const handleSave = async (formData) => {
    if (!canCreate && !editingItem) return;
    if (!canEdit && editingItem) return;

    try {
      // Data Transformation for specific cases
      const payload = { ...formData };

      // Handle comma-separated lists (e.g., aliases, subjects for jobs)
      // Check if any formField has specific transform requirements?
      // For now, hardcode based on known fields
      if (resourceName === 'Subject' && typeof payload.aliases === 'string') {
          payload.aliases = payload.aliases.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (resourceName === 'Job' && typeof payload.subjects === 'string') {
          // payload.subjects should be a list for the serializer
          payload.subjects = payload.subjects.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (editingItem) {
        await apiService.patch(`${getApiUrl(apiEndpoint)}${editingItem.id}/`, payload);
      } else {
        await apiService.post(getApiUrl(apiEndpoint), payload);
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (error) {
      console.error("Save error:", error);
      alert("Save failed: " + (error.response?.data?.detail || JSON.stringify(error.response?.data)));
    }
  };

  // Safe Pre-processing for Form
  const prepareInitialData = (item) => {
      if (!item) return {};
      const data = { ...item };

      if (Array.isArray(data.aliases)) data.aliases = data.aliases.join(', ');
      // For Job, subjects is usually a list of objects or strings depending on read serializer
      // The read serializer for Job returns subjects as list of strings in 'subject_details',
      // but 'subjects' field in read might be IDs or objects.
      // Let's check `subject_details` first
      if (resourceName === 'Job') {
          if (data.subject_details && Array.isArray(data.subject_details)) {
              data.subjects = data.subject_details.join(', ');
          } else if (Array.isArray(data.subjects)) {
              // fallback if it's strings
             data.subjects = data.subjects.map(s => typeof s === 'object' ? s.name : s).join(', ');
          }
      }

      return data;
  }

  const filteredData = Array.isArray(data) ? data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) : [];

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      {Object.keys(stats).length > 0 && (
        <div className="bg-white p-4 rounded shadow-sm flex flex-wrap">
            {Object.entries(stats).map(([key, val]) => (
                typeof val !== 'object' && <StatBadge key={key} label={key.replace(/_/g, ' ')} value={val} color={key === 'total' ? 'indigo' : 'gray'} />
            ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {canCreate && (
            <button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center hover:bg-indigo-700"
            >
            <Plus size={16} className="mr-2" /> Create New
            </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col, idx) => <th key={idx} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>)}
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={columns.length + 1} className="p-8 text-center">Loading...</td></tr>
            ) : filteredData.length === 0 ? (
               <tr><td colSpan={columns.length + 1} className="p-8 text-center text-gray-500">No data found</td></tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(item) : item[col.accessor]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex justify-end">
                        {customActions && customActions(item, fetchAll)}
                        {canEdit && <ActionButton onClick={() => { setEditingItem(prepareInitialData(item)); setIsModalOpen(true); }} icon={Edit2} color="text-indigo-600" title="Edit" />}
                        {canDelete && <ActionButton onClick={() => handleDelete(item.id)} icon={Trash2} color="text-red-600" title="Delete" />}
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? 'Edit' : 'Create'} ${resourceName}`}
      >
        <DynamicForm
          fields={formFields}
          initialData={editingItem || {}}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Simplified Overview (Reusable from previous)
export const OverviewStats = () => {
    const [stats, setStats] = useState({});
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const baseUrl = process.env.REACT_APP_API_URL || '';
                const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                const res = await apiService.get(`${cleanBase}/api/admin-dashboard/stats/`);
                setStats(res.data);
            } catch(e) {}
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Users', val: stats.total_users, color: 'blue' },
        { label: 'Active Jobs', val: stats.active_jobs, color: 'green' },
        { label: 'Revenue', val: `$${stats.total_revenue || 0}`, color: 'yellow' },
        { label: 'Reports', val: stats.pending_reports, color: 'red' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className={`bg-white p-6 rounded shadow border-l-4 border-${c.color}-500`}>
                        <div className="text-gray-500 uppercase text-xs font-bold">{c.label}</div>
                        <div className="text-3xl font-bold">{c.val}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {stats.recent_activity && stats.recent_activity.length > 0 ? (
                        stats.recent_activity.map((act, i) => (
                            <div key={i} className="flex justify-between border-b pb-2 last:border-0">
                                <span>{act.description}</span>
                                <span className="text-gray-400 text-sm">{new Date(act.timestamp).toLocaleDateString()}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500">No recent activity.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
