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
  // Map color names to our new semantic system or keep using tailwind colors directly
  // Using gradients for a colorful, professional look
  const colorClasses = {
    blue: "from-blue-500 to-indigo-500 shadow-blue-500/20",
    green: "from-emerald-500 to-teal-500 shadow-emerald-500/20",
    purple: "from-purple-500 to-fuchsia-500 shadow-purple-500/20",
    orange: "from-orange-500 to-amber-500 shadow-orange-500/20",
    red: "from-rose-500 to-red-500 shadow-rose-500/20",
    indigo: "from-indigo-500 to-violet-500 shadow-indigo-500/20",
  };

  const gradient = colorClasses[color] || colorClasses.blue;

  return (
    <div className="group relative bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] dark:opacity-[0.05] rounded-bl-full transition-transform group-hover:scale-150 duration-500`} />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
        </div>
        {subtext && (
          <div className="mt-2 inline-flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-full">
            {subtext}
          </div>
        )}
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
  items: propItems,
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
  canCreate = true,
  canEdit = true,
}) => {
  const [internalItems, setInternalItems] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalFilterStatus, setInternalFilterStatus] = useState('All');

  const items = propItems || internalItems;
  const loading = propIsLoading !== undefined ? propIsLoading : internalLoading;
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;
  const setSearchQuery = propSetSearchQuery || setInternalSearchQuery;
  const filterStatus = propFilterStatus !== undefined ? propFilterStatus : internalFilterStatus;
  const setFilterStatus = propSetFilterStatus || setInternalFilterStatus;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  const showAdd = !disableAdd && canCreate && (propOnAdd || (apiEndpoint && formFields));
  const showEdit = !disableEdit && canEdit && (propOnEdit || (apiEndpoint && formFields));
  const showDelete = !disableDelete && (propOnDelete || apiEndpoint);

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full relative">
      {/* Header Toolbar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-card">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title || resourceName || 'Resources'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your {(title || resourceName || '').toLowerCase()} data</p>
        </div>
        {showAdd && (
          <button
            onClick={handleAddClick}
            className="btn btn-primary"
          >
            <FaPlus className="mr-2" /> Add New
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-bg/50">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {statusOptions && (
          <div className="relative min-w-[180px]">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="input-field pl-10 cursor-pointer appearance-none"
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
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <FaSearch className="text-2xl text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No records found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                {columns.map((col) => (
                  <th
                    key={col.key || col.header}
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group select-none first:pl-6"
                    onClick={() => col.key && requestSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.key && (
                        <span className="text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                  {columns.map((col) => (
                    <td key={col.key || col.header} className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap first:pl-6">
                      {col.render ? col.render(item[col.key] || item, item) : (item[col.key] || '-')}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                      {customActions && customActions(item, fetchData)}

                      {onView && (
                         <button
                           onClick={() => onView(item)}
                           className="p-2 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                           title="View Details"
                         >
                           <FaEye />
                         </button>
                      )}

                      {showEdit && (
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                      )}

                      {showDelete && (
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-dark-card">
           <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(indexOfLastItem, items.length)}</span> of <span className="font-medium text-slate-900 dark:text-white">{items.length}</span> results
           </span>
           <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                       currentPage === page
                       ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                       : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                 >
                    {page}
                 </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
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
