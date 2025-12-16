import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { notificationAPI } from '../utils/apiService';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  MessageSquare,
  DollarSign,
  UserPlus,
  Briefcase,
  Star,
  Gift,
  AlertCircle,
  Calendar,
  Sparkles,
  Filter,
  RefreshCw
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
      };

      if (filter === 'unread') {
        params.is_read = false;
      } else if (filter === 'read') {
        params.is_read = true;
      }

      const response = await notificationAPI.getNotifications(params);

      if (response.data && response.data.results) {
        setNotifications(response.data.results);
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE));
      } else if (Array.isArray(response.data)) {
        setNotifications(response.data);
        setTotalCount(response.data.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationAPI.deleteNotification(id);
        setNotifications(notifications.filter(n => n.id !== id));
        setTotalCount(totalCount - 1);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNotificationIcon = (type) => {
    const iconClasses = "w-5 h-5";

    switch (type) {
      case 'message':
        return <MessageSquare className={iconClasses} />;
      case 'payment':
      case 'credit':
        return <DollarSign className={iconClasses} />;
      case 'follow':
      case 'new_user':
        return <UserPlus className={iconClasses} />;
      case 'job':
      case 'gig':
        return <Briefcase className={iconClasses} />;
      case 'review':
      case 'rating':
        return <Star className={iconClasses} />;
      case 'gift':
        return <Gift className={iconClasses} />;
      case 'system':
        return <Bell className={iconClasses} />;
      default:
        return <Bell className={iconClasses} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400';
      case 'payment':
      case 'credit':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400';
      case 'follow':
      case 'new_user':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400';
      case 'job':
      case 'gig':
        return 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400';
      case 'review':
      case 'rating':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400';
      case 'gift':
        return 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 pt-24 pb-20 lg:pt-28 lg:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pill Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Stay Updated</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-white tracking-tight mb-4">
            Notifications
          </h1>

          <p className="text-lg text-white/90 text-center max-w-2xl mx-auto mb-8">
            Stay informed about all your activities, messages, and updates in one place.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-white/90">
              <Bell className="w-5 h-5" />
              <span className="font-semibold">{totalCount}</span>
              <span>Total</span>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 text-white/90">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">{unreadCount}</span>
                <span>Unread</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        {/* Controls Card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm dark:shadow-dark-md border border-gray-200 dark:border-dark-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilter('all'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-1.5" />
                All
              </button>
              <button
                onClick={() => { setFilter('unread'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'unread'
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
              <button
                onClick={() => { setFilter('read'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'read'
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                Read
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={fetchNotifications}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 rounded-xl transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group bg-white dark:bg-dark-card rounded-2xl border shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300 overflow-hidden cursor-pointer ${
                  notification.is_read
                    ? 'border-gray-100 dark:border-dark-border'
                    : 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/20'
                }`}
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor(notification.notification_type)}`}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className={`text-base font-semibold ${
                        notification.is_read
                          ? 'text-slate-800 dark:text-dark-text-primary'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {notification.title || 'Notification'}
                      </p>
                      {!notification.is_read && (
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5"></div>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-dark-text-secondary mb-3 line-clamp-2">
                      {notification.message || notification.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-dark-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">{formatDateTime(notification.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {notifications.length === 0 && (
              <div className="text-center py-16 sm:py-20 bg-white dark:bg-dark-card rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 dark:from-indigo-950/40 to-purple-100 dark:to-purple-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Bell className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                </div>

                <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-2">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </h3>
                <p className="text-slate-500 dark:text-dark-text-secondary mb-6 max-w-sm mx-auto">
                  {filter === 'unread'
                    ? "You've read all your notifications. Check back later for updates."
                    : "You don't have any notifications at the moment."}
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    View All Notifications
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
