import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Users,
  Briefcase,
  DollarSign,
  Activity,
  Search,
  Settings,
  Shield,
  FileText,
  UserCheck,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  BookOpen,
  Map,
  CreditCard
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_users: 0,
    active_jobs: 0,
    total_revenue: 0,
    recent_activity: []
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [subTab, setSubTab] = useState(''); // For Settings: 'packages', 'tiers', 'groups'
  const [searchTerm, setSearchTerm] = useState('');

  // New States for Forms
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user && user.user_type !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        const statsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin-dashboard/stats/`, { headers });
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };
    fetchStats();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'settings' && !subTab) {
        setSubTab('packages'); // Default subtab for settings
    }
    if (activeTab !== 'overview') {
      fetchData(activeTab, subTab);
    }
  }, [activeTab, subTab]);

  const fetchData = async (tab, sub = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      let endpoint = '';

      switch (tab) {
        case 'users': endpoint = '/api/admin/users/'; break;
        case 'jobs': endpoint = '/api/admin/jobs/'; break;
        case 'payments': endpoint = '/api/admin/payments/'; break;
        case 'reports': endpoint = '/api/admin/reports/'; break;
        case 'subjects': endpoint = '/api/admin/subjects/'; break;
        case 'gigs': endpoint = '/api/admin/gigs/'; break;
        case 'moderators': endpoint = '/api/admin/users/?user_type=moderator'; break;
        case 'settings':
            if (sub === 'packages') endpoint = '/api/admin/point-packages/';
            else if (sub === 'tiers') endpoint = '/api/admin/pricing-tiers/';
            else if (sub === 'groups') endpoint = '/api/admin/country-groups/';
            break;
        default: break;
      }

      if (endpoint) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`, { headers });
        setData(response.data.results || response.data);
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, endpointType, method = 'post', payload = {}) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem('access_token');
      // Fix for settings sub-resources mapping to correct endpoints
      let finalEndpointType = endpointType;

      const url = `${process.env.REACT_APP_API_URL}/api/admin/${finalEndpointType}/${id}/${action ? action + '/' : ''}`;

      if (method === 'delete') {
        await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchData(activeTab, subTab);
    } catch (error) {
      console.error(`Error performing action:`, error);
      alert("Action failed");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      let url = '';

      if (modalType === 'subject') {
        url = `${process.env.REACT_APP_API_URL}/api/admin/subjects/`;
      } else if (modalType === 'moderator') {
         await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/users/${formData.userId}/make_moderator/`, {}, { headers });
         setShowModal(false);
         fetchData(activeTab);
         return;
      } else if (modalType === 'package') {
          url = `${process.env.REACT_APP_API_URL}/api/admin/point-packages/`;
      } else if (modalType === 'tier') {
          url = `${process.env.REACT_APP_API_URL}/api/admin/pricing-tiers/`;
      } else if (modalType === 'group') {
          url = `${process.env.REACT_APP_API_URL}/api/admin/country-groups/`;
      }

      if (url) {
        await axios.post(url, formData, { headers });
        setShowModal(false);
        fetchData(activeTab, subTab);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit");
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-8 text-center">Loading...</div>;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={stats.total_users} icon={Users} color="#4F46E5" />
              <StatCard title="Active Jobs" value={stats.active_jobs} icon={Briefcase} color="#10B981" />
              <StatCard title="Total Revenue" value={`$${stats.total_revenue}`} icon={DollarSign} color="#F59E0B" />
              <StatCard title="Pending Reports" value={stats.pending_reports || 0} icon={Shield} color="#EF4444" />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-semibold">Recent Activity</h3></div>
                <div className="divide-y divide-gray-100">
                    {stats.recent_activity.map((a, i) => (
                        <div key={i} className="px-6 py-4 flex items-center">
                            <Activity size={16} className="text-blue-600 mr-4" />
                            <div><p className="text-sm font-medium">{a.description}</p><p className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</p></div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <DataTable
            columns={['User', 'Role', 'Status', 'Joined', 'Actions']}
            data={data}
            searchTerm={searchTerm}
            filterFn={(u, term) => u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)}
            renderRow={(u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><div className="font-medium">{u.username}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                <td className="px-6 py-4 capitalize">{u.user_type}</td>
                <td className="px-6 py-4"><Badge active={u.is_active} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <ActionButton onClick={() => handleAction(u.id, u.is_active ? 'block' : 'unblock', 'users')} icon={u.is_active ? Ban : CheckCircle} color={u.is_active ? 'text-orange-500' : 'text-green-500'} />
                  <ActionButton onClick={() => handleAction(u.id, '', 'users', 'delete')} icon={Trash2} color="text-red-500" />
                </td>
              </tr>
            )}
          />
        );

      case 'jobs':
        return (
          <DataTable
            columns={['Title', 'Student', 'Service', 'Status', 'Actions']}
            data={data}
            searchTerm={searchTerm}
            filterFn={(j, term) => (j.description || '').toLowerCase().includes(term) || j.service_type.toLowerCase().includes(term)}
            renderRow={(j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 truncate max-w-xs">{j.description || j.title || "No Desc"}</td>
                <td className="px-6 py-4">{j.student ? j.student.username : 'Unknown'}</td>
                <td className="px-6 py-4">{j.service_type}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${j.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{j.status}</span></td>
                <td className="px-6 py-4 flex space-x-2">
                   {j.status === 'Open' && <ActionButton onClick={() => handleAction(j.id, 'close', 'jobs')} icon={XCircle} color="text-orange-500" />}
                   <ActionButton onClick={() => handleAction(j.id, '', 'jobs', 'delete')} icon={Trash2} color="text-red-500" />
                </td>
              </tr>
            )}
          />
        );

      case 'payments':
        return (
          <DataTable
            columns={['Order ID', 'User', 'Amount', 'Status', 'Date']}
            data={data}
            searchTerm={searchTerm}
            filterFn={(p, term) => p.transaction_id?.includes(term) || p.status.toLowerCase().includes(term)}
            renderRow={(p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{p.order || 'N/A'} <br/><span className="text-xs text-gray-500">{p.transaction_id}</span></td>
                <td className="px-6 py-4">{p.order?.user || 'Guest'}</td>
                <td className="px-6 py-4">{p.currency} {p.amount}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${p.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</td>
              </tr>
            )}
          />
        );

      case 'subjects':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold">Subjects</h3>
               <button onClick={() => { setModalType('subject'); setShowModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center"><Plus size={16} className="mr-2"/> Add Subject</button>
            </div>
            <DataTable
                columns={['Name', 'Aliases', 'Active', 'Actions']}
                data={data}
                searchTerm={searchTerm}
                filterFn={(s, term) => s.name.toLowerCase().includes(term)}
                renderRow={(s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{s.name}</td>
                    <td className="px-6 py-4 text-sm">{s.aliases}</td>
                    <td className="px-6 py-4">{s.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4">
                      <ActionButton onClick={() => handleAction(s.id, '', 'subjects', 'delete')} icon={Trash2} color="text-red-500" />
                    </td>
                  </tr>
                )}
            />
          </div>
        );

      case 'gigs':
        return (
            <DataTable
                columns={['Title', 'Tutor', 'Subject', 'Created', 'Actions']}
                data={data}
                searchTerm={searchTerm}
                filterFn={(g, term) => g.title?.toLowerCase().includes(term)}
                renderRow={(g) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{g.title || 'Untitled'}</td>
                        <td className="px-6 py-4">{g.tutor}</td>
                        <td className="px-6 py-4">{g.subject}</td>
                        <td className="px-6 py-4 text-sm">{new Date(g.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                            <ActionButton onClick={() => handleAction(g.id, '', 'gigs', 'delete')} icon={Trash2} color="text-red-500" />
                        </td>
                    </tr>
                )}
            />
        );

      case 'reports':
        return (
          <DataTable
            columns={['Target', 'Reported By', 'Type', 'Date', 'Actions']}
            data={data}
            renderRow={(r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">ID: {r.target_id}</td>
                <td className="px-6 py-4">{r.reported_user_id || 'Anon'}</td>
                <td className="px-6 py-4">{r.target_type}</td>
                <td className="px-6 py-4 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                   <ActionButton onClick={() => handleAction(r.id, '', 'reports', 'delete')} icon={CheckCircle} color="text-green-500" />
                </td>
              </tr>
            )}
          />
        );

      case 'moderators':
          return (
              <div>
                  <div className="flex justify-end mb-4">
                      <button onClick={() => { setModalType('moderator'); setShowModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center"><Plus size={16} className="mr-2"/> Add Moderator</button>
                  </div>
                   <DataTable
                    columns={['User', 'Email', 'Actions']}
                    data={data}
                    searchTerm={searchTerm}
                    filterFn={(u, term) => u.username.toLowerCase().includes(term)}
                    renderRow={(u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{u.username}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                           <ActionButton onClick={() => handleAction(u.id, 'remove_moderator', 'users')} icon={Trash2} color="text-red-500" />
                        </td>
                      </tr>
                    )}
                  />
              </div>
          );

      case 'settings':
          return (
              <div className="space-y-6">
                  <div className="flex border-b">
                      <button className={`px-4 py-2 ${subTab === 'packages' ? 'border-b-2 border-indigo-600 font-bold' : ''}`} onClick={() => setSubTab('packages')}>Point Packages</button>
                      <button className={`px-4 py-2 ${subTab === 'tiers' ? 'border-b-2 border-indigo-600 font-bold' : ''}`} onClick={() => setSubTab('tiers')}>Pricing Tiers</button>
                      <button className={`px-4 py-2 ${subTab === 'groups' ? 'border-b-2 border-indigo-600 font-bold' : ''}`} onClick={() => setSubTab('groups')}>Country Groups</button>
                  </div>

                  <div className="flex justify-end">
                      <button onClick={() => { setModalType(subTab === 'packages' ? 'package' : subTab === 'tiers' ? 'tier' : 'group'); setShowModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center capitalize"><Plus size={16} className="mr-2"/> Add {subTab.slice(0, -1)}</button>
                  </div>

                  {subTab === 'packages' && (
                      <DataTable
                        columns={['Name', 'Price ($)', 'Points', 'Bonus', 'Actions']}
                        data={data}
                        renderRow={(p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{p.name}</td>
                                <td className="px-6 py-4">{p.price_usd}</td>
                                <td className="px-6 py-4">{p.base_points}</td>
                                <td className="px-6 py-4">{p.bonus_points}</td>
                                <td className="px-6 py-4"><ActionButton onClick={() => handleAction(p.id, '', 'point-packages', 'delete')} icon={Trash2} color="text-red-500" /></td>
                            </tr>
                        )}
                      />
                  )}
                  {subTab === 'tiers' && (
                      <DataTable
                        columns={['Min Rate', 'Max Rate', 'Points', 'Actions']}
                        data={data}
                        renderRow={(t) => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{t.min_rate}</td>
                                <td className="px-6 py-4">{t.max_rate || '∞'}</td>
                                <td className="px-6 py-4">{t.points}</td>
                                <td className="px-6 py-4"><ActionButton onClick={() => handleAction(t.id, '', 'pricing-tiers', 'delete')} icon={Trash2} color="text-red-500" /></td>
                            </tr>
                        )}
                      />
                  )}
                  {subTab === 'groups' && (
                      <DataTable
                        columns={['Name', 'Group Code', 'Actions']}
                        data={data}
                        renderRow={(g) => (
                            <tr key={g.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{g.name}</td>
                                <td className="px-6 py-4">{g.group}</td>
                                <td className="px-6 py-4"><ActionButton onClick={() => handleAction(g.id, '', 'country-groups', 'delete')} icon={Trash2} color="text-red-500" /></td>
                            </tr>
                        )}
                      />
                  )}
              </div>
          );

      default: return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-64 bg-white shadow-lg hidden md:block z-10 overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-indigo-700 flex items-center"><Shield className="mr-2" /> Admin Panel</h2>
          </div>
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'payments', label: 'Payments', icon: DollarSign },
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
              { id: 'gigs', label: 'Gigs', icon: FileText },
              { id: 'reports', label: 'Reports', icon: AlertTriangle },
              { id: 'moderators', label: 'Moderators', icon: UserCheck },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <item.icon size={20} className="mr-3" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 capitalize">{activeTab}</h1>
            {activeTab !== 'overview' && activeTab !== 'settings' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </header>
          {renderContent()}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 capitalize">Add {modalType}</h3>
                <form onSubmit={handleFormSubmit}>
                    {modalType === 'subject' && (
                        <>
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Aliases (comma sep)" onChange={e => setFormData({...formData, aliases: e.target.value})} />
                            <label className="flex items-center"><input type="checkbox" className="mr-2" onChange={e => setFormData({...formData, is_active: e.target.checked})} /> Active</label>
                        </>
                    )}
                    {modalType === 'moderator' && (
                        <input className="w-full border p-2 mb-2 rounded" placeholder="User ID to promote" onChange={e => setFormData({...formData, userId: e.target.value})} required />
                    )}
                    {modalType === 'package' && (
                        <>
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Price (USD)" type="number" step="0.01" onChange={e => setFormData({...formData, price_usd: e.target.value})} required />
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Base Points" type="number" onChange={e => setFormData({...formData, base_points: e.target.value})} required />
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Bonus Points" type="number" onChange={e => setFormData({...formData, bonus_points: e.target.value})} />
                        </>
                    )}
                    {modalType === 'tier' && (
                         <>
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Min Rate" type="number" step="0.01" onChange={e => setFormData({...formData, min_rate: e.target.value})} required />
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Max Rate (leave blank for ∞)" type="number" step="0.01" onChange={e => setFormData({...formData, max_rate: e.target.value})} />
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Points" type="number" onChange={e => setFormData({...formData, points: e.target.value})} required />
                        </>
                    )}
                    {modalType === 'group' && (
                         <>
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Country Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Group Code (e.g. G1)" onChange={e => setFormData({...formData, group: e.target.value})} required />
                        </>
                    )}
                    <div className="flex justify-end mt-4 space-x-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for cleaner code
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 border-l-4" style={{ borderColor: color }}>
    <div className={`p-3 rounded-full bg-opacity-20`} style={{ backgroundColor: color }}><Icon size={24} color={color} /></div>
    <div><p className="text-gray-500 text-sm font-medium uppercase">{title}</p><h3 className="text-2xl font-bold text-gray-800">{value}</h3></div>
  </div>
);

const DataTable = ({ columns, data, searchTerm, filterFn, renderRow }) => {
    const safeData = Array.isArray(data) ? data : [];
    const filteredData = searchTerm && filterFn ? safeData.filter(item => filterFn(item, searchTerm.toLowerCase())) : safeData;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>{columns.map((c, i) => <th key={i} className="px-6 py-3">{c}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.length > 0 ? filteredData.map(renderRow) : <tr><td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">No data found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Badge = ({ active }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {active ? 'Active' : 'Blocked'}
    </span>
);

const ActionButton = ({ onClick, icon: Icon, color }) => (
    <button onClick={onClick} className={`p-1 rounded hover:bg-gray-200 ${color}`}><Icon size={18} /></button>
);

export default AdminDashboard;
