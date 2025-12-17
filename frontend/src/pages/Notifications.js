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
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'payment':
      case 'credit':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'follow':
      case 'new_user':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'job':
      case 'gig':
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400';
      case 'review':
      case 'rating':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'gift':
        return 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400';
      default:
        return 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-400';
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-secondary-600 to-pink-500 pt-24 pb-20 lg:pt-28 lg:pb-24 overflow-hidden">
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
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg dark:shadow-glow border border-gray-100 dark:border-dark-border p-4 mb-6 relative z-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilter('all'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-1.5" />
                All
              </button>
              <button
                onClick={() => { setFilter('unread'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'unread'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
              <button
                onClick={() => { setFilter('read'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'read'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                Read
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={fetchNotifications}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-xl transition-colors disabled:opacity-50"
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
                className={`group bg-white dark:bg-dark-card rounded-2xl border shadow-sm dark:shadow-dark-md hover:shadow-lg dark:hover:shadow-glow transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-0.5 ${
                  notification.is_read
                    ? 'border-gray-100 dark:border-dark-border'
                    : 'border-primary-200 dark:border-primary-800/50 bg-primary-50/30 dark:bg-primary-900/10'
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
                      <p className={`text-base font-bold ${
                        notification.is_read
                          ? 'text-gray-800 dark:text-white'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {notification.title || 'Notification'}
                      </p>
                      {!notification.is_read && (
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-1.5 shadow-sm shadow-primary-500/50"></div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                      {notification.message || notification.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{formatDateTime(notification.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
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
                          className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
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
              <div className="text-center py-16 sm:py-20 bg-white dark:bg-dark-card rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-border">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 dark:from-primary-950/40 to-secondary-100 dark:to-secondary-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Bell className="w-10 h-10 text-primary-500 dark:text-primary-400" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  {filter === 'unread'
                    ? "You've read all your notifications. Check back later for updates."
                    : "You don't have any notifications at the moment."}
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
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
