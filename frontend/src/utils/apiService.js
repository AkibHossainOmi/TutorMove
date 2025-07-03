import axios from 'axios';

// Create axios instance with default configuration
const apiService = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => apiService.post('/auth/login/', credentials),
  signup: (userData) => apiService.post('/auth/signup/', userData),
  googleLogin: (tokenId) => apiService.post('/auth/google-login/', { token_id: tokenId }),
  getCurrentUser: () => apiService.get('/auth/user/'),
  updateProfile: (profileData) => apiService.patch('/auth/user/', profileData),
  logout: () => apiService.post('/auth/logout/'),
  changePassword: (passwordData) => apiService.post('/auth/change-password/', passwordData),
  updateContactInfo: (contactData) => apiService.patch('/auth/contact-info/', contactData),
};

// Tutor API calls
export const tutorAPI = {
  searchTutors: (params) => apiService.get('/tutors/search/', { params }),
  getTutorProfile: (id) => apiService.get(`/tutors/${id}/`),
  getTutorGigs: (params) => apiService.get('/tutors/', { params }),
  createGig: (gigData) => apiService.post('/tutors/', gigData),
  updateGig: (id, gigData) => apiService.patch(`/tutors/${id}/`, gigData),
  deleteGig: (id) => apiService.delete(`/tutors/${id}/`),
  getFavoriteTutors: () => apiService.get('/tutors/favorites/'),
  addToFavorites: (tutorId) => apiService.post(`/tutors/${tutorId}/favorite/`),
  removeFromFavorites: (tutorId) => apiService.delete(`/tutors/${tutorId}/favorite/`),
  getMatchedJobs: () => apiService.get('/tutors/matched-jobs/'),
  updateTeachingDetails: (details) => apiService.patch('/tutors/teaching-details/', details),
  updateEducation: (eduData) => apiService.patch('/tutors/education/', eduData),
  toggleGigVisibility: (gigId, isVisible) => apiService.patch(`/tutors/${gigId}/visibility/`, { is_visible: isVisible }),
  promoteGig: (gigId) => apiService.post(`/tutors/${gigId}/promote/`),
};

// Job API calls
export const jobAPI = {
  getJobs: (params) => apiService.get('/jobs/', { params }),
  getJobDetail: (id) => apiService.get(`/jobs/${id}/`),
  createJob: (jobData) => apiService.post('/jobs/', jobData),
  updateJob: (id, jobData) => apiService.patch(`/jobs/${id}/`, jobData),
  deleteJob: (id) => apiService.delete(`/jobs/${id}/`),
  applyToJob: (applicationData) => apiService.post('/applications/', applicationData),
  getApplicationStatus: (id) => apiService.get(`/applications/${id}/`),
  getMyApplications: (params) => apiService.get('/applications/', { params }),
  updateApplicationStatus: (id, status) => apiService.patch(`/applications/${id}/`, { status }),
  getJobsBySubject: (subject) => apiService.get('/jobs/by-subject/', { params: { subject } }),
  getJobsByLocation: (location) => apiService.get('/jobs/by-location/', { params: { location } }),
};

// Credit API calls
export const creditAPI = {
  getCreditBalance: () => apiService.get('/credits/'),
  purchaseCredits: (purchaseData) => apiService.post('/payments/purchase-credits/', purchaseData),
  getCreditHistory: (params) => apiService.get('/credits/history/', { params }),
  transferCredits: (transferData) => apiService.post('/credits/transfer/', transferData),
  getReferralCode: () => apiService.get('/credits/referral-code/'),
  applyReferralCode: (code) => apiService.post('/credits/apply-referral/', { code }),
  getEarnings: () => apiService.get('/credits/earnings/'),
  withdrawEarnings: (data) => apiService.post('/credits/withdraw/', data),
  getPendingPayments: () => apiService.get('/credits/pending-payments/'),
};

// Review API calls
export const reviewAPI = {
  getReviews: (params) => apiService.get('/reviews/', { params }),
  createReview: (reviewData) => apiService.post('/reviews/', reviewData),
  updateReview: (id, reviewData) => apiService.patch(`/reviews/${id}/`, reviewData),
  deleteReview: (id) => apiService.delete(`/reviews/${id}/`),
  getMyReviews: () => apiService.get('/reviews/my-reviews/'),
  getPendingReviews: () => apiService.get('/reviews/pending/'),
};

// Message API calls
export const messageAPI = {
  getConversations: (params) => apiService.get('/messages/conversations/', { params }),
  getConversationMessages: (id, params) => apiService.get(`/messages/conversations/${id}/`, { params }),
  sendMessage: (messageData) => apiService.post('/messages/', messageData),
  markAsRead: (conversationId) => apiService.post(`/messages/conversations/${conversationId}/mark-read/`),
  deleteConversation: (id) => apiService.delete(`/messages/conversations/${id}/`),
  initiateChat: (userId) => apiService.post('/messages/initiate/', { user_id: userId }),
};

// Notification API calls
export const notificationAPI = {
  getNotifications: (params) => apiService.get('/notifications/', { params }),
  markAsRead: (id) => apiService.patch(`/notifications/${id}/`, { is_read: true }),
  markAllAsRead: () => apiService.post('/notifications/mark-all-read/'),
  deleteNotification: (id) => apiService.delete(`/notifications/${id}/`),
  updateNotificationPreferences: (preferences) => apiService.patch('/notifications/preferences/', preferences),
};

// Settings API calls
export const settingsAPI = {
  getUserSettings: () => apiService.get('/settings/'),
  updateSettings: (settingsData) => apiService.patch('/settings/', settingsData),
  changePassword: (passwordData) => apiService.post('/settings/change-password/', passwordData),
  deactivateAccount: () => apiService.post('/settings/deactivate/'),
  deleteAccount: () => apiService.delete('/settings/delete-account/'),
  updatePrivacy: (privacySettings) => apiService.patch('/settings/privacy/', privacySettings),
  updateJobNotifications: (notificationSettings) => apiService.patch('/settings/job-notifications/', notificationSettings),
  updateSearchVisibility: (isVisible) => apiService.patch('/settings/search-visibility/', { is_visible: isVisible }),
};

// Premium features API calls
export const premiumAPI = {
  getPremiumStatus: () => apiService.get('/premium/status/'),
  upgradeToPremium: (planData) => apiService.post('/premium/upgrade/', planData),
  cancelPremium: () => apiService.post('/premium/cancel/'),
  getPremiumFeatures: () => apiService.get('/premium/features/'),
  getPremiumAnalytics: () => apiService.get('/premium/analytics/'),
};

// File upload utility
export const uploadFile = async (file, endpoint = '/upload/') => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiService.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Generic API call utility
export const apiCall = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await apiService({
      method,
      url: endpoint,
      data,
      ...config,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
    };
  }
};

export default apiService;
