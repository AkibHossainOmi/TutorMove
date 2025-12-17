// components/DashboardComponents.js
import React, { useState, useEffect } from 'react';
import {
  FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus, FaSearch,
  FaFilter, FaChevronLeft, FaChevronRight, FaEye, FaSort, FaSortUp, FaSortDown
} from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal';
import DynamicForm from './DynamicForm';
import LoadingSpinner from './LoadingSpinner';
import apiService from '../utils/apiService';

// --- Improved Overview Stats Card ---
export const OverviewStats = ({ title, value, icon, color = "blue", subtext }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50",
    purple: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50",
    orange: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50",
    red: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50",
  };

  const style = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border dark:border-slate-800 transition-all duration-300 hover:shadow-md ${style.replace("bg-", "border-").replace("text-", "hover:border-")}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className={`p-3 rounded-lg ${style}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        {subtext && <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{subtext}</span>}
      </div>
    </div>
  );
};

// --- Modern Resource Manager (Table & Controls) ---
export const ResourceManager = ({
  title,
  resourceName,
  apiEndpoint,
  columns,
  formFields,
  items: propItems, // Optional: if provided, we use these instead of fetching
  onEdit: propOnEdit,
  onDelete: propOnDelete,
  onAdd: propOnAdd,
  onView,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
  filterStatus: propFilterStatus,
  setFilterStatus: propSetFilterStatus,
  statusOptions,
  isLoading: propIsLoading,
  disableAdd = false,
  disableEdit = false,
  disableDelete = false,
  customActions = null,
  itemsPerPage = 10,
  canCreate = true, // Legacy prop support
  canEdit = true,   // Legacy prop support
}) => {
  // Internal state for fetching if not managed by parent
  const [internalItems, setInternalItems] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalFilterStatus, setInternalFilterStatus] = useState('All');

  // Use props if provided, otherwise internal state
  const items = propItems || internalItems;
  const loading = propIsLoading !== undefined ? propIsLoading : internalLoading;
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;
  const setSearchQuery = propSetSearchQuery || setInternalSearchQuery;
  const filterStatus = propFilterStatus !== undefined ? propFilterStatus : internalFilterStatus;
  const setFilterStatus = propSetFilterStatus || setInternalFilterStatus;

  // Actions
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch data if apiEndpoint is provided and items are not passed
  const fetchData = async () => {
    if (!apiEndpoint || propItems) return;
    setInternalLoading(true);
    try {
      let url = apiEndpoint;
      const params = [];
      if (searchQuery) params.push(`search=${searchQuery}`);
      if (filterStatus && filterStatus !== 'All') params.push(`status=${filterStatus}`);

      if (params.length > 0) {
        url += (url.includes('?') ? '&' : '?') + params.join('&');
      }

      const res = await apiService.get(url);
      setInternalItems(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint, searchQuery, filterStatus]);

  // Sorting
  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortConfig.direction === 'asc'
          ? (valA > valB ? 1 : -1)
          : (valA < valB ? 1 : -1);
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddClick = () => {
    if (propOnAdd) propOnAdd();
    else {
      setEditItem(null);
      setIsFormOpen(true);
    }
  };

  const handleEditClick = (item) => {
    if (propOnEdit) propOnEdit(item);
    else {
      setEditItem(item);
      setIsFormOpen(true);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      if (propOnDelete) {
        propOnDelete(deleteConfirmId);
      } else if (apiEndpoint) {
        try {
          await apiService.delete(`${apiEndpoint}${deleteConfirmId}/`);
          fetchData();
        } catch (err) {
          console.error("Delete failed", err);
          alert("Failed to delete item");
        }
      }
      setDeleteConfirmId(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editItem) {
        await apiService.patch(`${apiEndpoint}${editItem.id}/`, formData);
      } else {
        await apiService.post(apiEndpoint, formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save item: " + (err.response?.data?.detail || err.message));
    }
  };

  // Determine permissions
  const showAdd = !disableAdd && canCreate && (propOnAdd || (apiEndpoint && formFields));
  const showEdit = !disableEdit && canEdit && (propOnEdit || (apiEndpoint && formFields));
  const showDelete = !disableDelete && (propOnDelete || apiEndpoint);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col h-full relative">
      {/* Header Toolbar */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{title || resourceName || 'Resources'}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your {(title || resourceName || '').toLowerCase()} data</p>
        </div>
        {showAdd && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <FaPlus /> Add New
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-slate-800 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {statusOptions && (
          <div className="relative min-w-[180px]">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white dark:bg-slate-800 dark:text-white cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-grow min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <FaSearch className="text-2xl text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-lg font-medium text-gray-500 dark:text-slate-400">No records found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold">
                {columns.map((col) => (
                  <th
                    key={col.key || col.header}
                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group select-none"
                    onClick={() => col.key && requestSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.key && (
                        <span className="text-gray-300 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300">
                           {sortConfig.key === col.key ? (
                              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                           ) : <FaSort />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  {columns.map((col) => (
                    <td key={col.key || col.header} className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                      {col.render ? col.render(item[col.key] || item, item) : (item[col.key] || '-')}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {customActions && customActions(item, fetchData)}

                      {onView && (
                         <button
                           onClick={() => onView(item)}
                           className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                           title="View Details"
                         >
                           <FaEye />
                         </button>
                      )}

                      {showEdit && (
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                      )}

                      {showDelete && (
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer / Pagination */}
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
           <span className="text-sm text-gray-500 dark:text-slate-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, items.length)} of {items.length}
           </span>
           <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, currentPage - 2),
                  Math.min(totalPages, currentPage + 1)
              ).map(page => (
                 <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                       currentPage === page
                       ? 'bg-indigo-600 text-white shadow-sm'
                       : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                 >
                    {page}
                 </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
           </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />

      {isFormOpen && formFields && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm">
           <div className="w-full max-w-lg">
              <DynamicForm
                 title={`${editItem ? 'Edit' : 'Add'} ${resourceName || 'Item'}`}
                 fields={formFields}
                 initialValues={editItem}
                 onSubmit={handleFormSubmit}
                 onCancel={() => setIsFormOpen(false)}
              />
           </div>
        </div>
      )}
    </div>
  );
};

// Re-export needed components
export { DynamicForm, ConfirmationModal, LoadingSpinner };
