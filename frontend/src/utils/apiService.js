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
  (error) => Promise.reject(error)
);

// To avoid multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle errors and refresh token
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiService(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint (no body, withCredentials to send refresh cookie)
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.access;

        // Save new token to localStorage
        localStorage.setItem('token', newAccessToken);

        // Update Authorization header defaults
        apiService.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return apiService(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const whatsappAPI = {
  // Send OTP to authenticated user's phone number
  sendOTP: (phoneNumber) =>
    apiService.post('/api/whatsapp/send/', { phone_number: phoneNumber }),

  // Verify OTP submitted by authenticated user
  verifyOTP: (otp) =>
    apiService.post('/api/whatsapp/verify/', { otp }),
};
// Auth API calls
export const authAPI = {
  login: (credentials) => apiService.post('/api/auth/login/', credentials),
  signup: (userData) => apiService.post('/api/auth/register/', userData),
  googleLogin: (tokenId) => apiService.post('/auth/google-login/', { token_id: tokenId }),
  getCurrentUser: () => apiService.get('/api/auth/user/'),
  updateProfile: (profileData) => apiService.patch('/api/auth/user/', profileData),
  logout: () => apiService.post('/api/auth/logout/'),
  changePassword: (passwordData) => apiService.post('/api/auth/change-password/', passwordData),
  updateContactInfo: (contactData) => apiService.patch('/api/auth/contact-info/', contactData),
  sendOtp: (data) => apiService.post('/api/auth/send-otp/', data),
  verifyOtp: (data) => apiService.post('/api/auth/verify-otp/', data),
};

export const contactUnlockAPI = {
  unlockContact: (tutorId) =>
    apiService.post('/api/contact-unlock/unlock/', { tutor_id: tutorId }),

  checkUnlockStatus: (tutorId) =>
    apiService.get('/api/contact-unlock/status/', { params: { tutor_id: tutorId } }),
};

// Tutor API calls
export const tutorAPI = {
  searchTutors: (params) => apiService.post('/api/tutors/search/', params),
  getTutorProfile: (id) => apiService.get(`/api/tutors/${id}/`),
  getTutors: () => apiService.get(`/api/tutors/`),
  createGig: (gigData) => apiService.post('/api/tutors/', gigData),
  updateGig: (id, gigData) => apiService.patch(`/api/tutors/${id}/`, gigData),
  deleteGig: (id) => apiService.delete(`/api/tutors/${id}/`),
  getFavoriteTutors: () => apiService.get('/api/tutors/favorites/'),
  addToFavorites: (tutorId) => apiService.post(`/api/tutors/${tutorId}/favorite/`),
  removeFromFavorites: (tutorId) => apiService.delete(`/api/tutors/${tutorId}/favorite/`),
  updateTeachingDetails: (details) => apiService.patch('/api/tutors/teaching-details/', details),
  updateEducation: (eduData) => apiService.patch('/api/tutors/education/', eduData),
  toggleGigVisibility: (gigId, isVisible) => apiService.patch(`/api/tutors/${gigId}/visibility/`, { is_visible: isVisible }),
  promoteGig: (gigId) => apiService.post(`/api/tutors/${gigId}/promote/`),
};

// Job API calls
export const jobAPI = {
  getJobs: (params) => apiService.get('/api/jobs/', { params }),

  getJobDetail: (id) => apiService.get(`/api/jobs/${id}/`),

  createJob: (jobData) => apiService.post('/api/jobs/', jobData),

  updateJob: (id, jobData) => apiService.patch(`/api/jobs/${id}/`, jobData),

  deleteJob: (id) => apiService.delete(`/api/jobs/${id}/`),

  getJobsBySubject: (subject) =>
    apiService.get('/api/jobs/by-subject/', { params: { subject } }),

  getJobsByLocation: (location) =>
    apiService.get('/api/jobs/by-location/', { params: { location } }),

  unlockJob: (id) => apiService.post(`/api/jobs/${id}/unlock/`),

  getJobUnlockPreview: (jobId) => apiService.get(`/api/jobs/${jobId}/preview/`),

  getMatchedJobs: () => apiService.get('/api/jobs/matched_jobs/'),
};

export const gigApi = {
  getGigs: () => apiService.get('/api/gigs/'),
  createGig: (gigData) => apiService.post('/api/gigs/', gigData),
  updateGig: (id, gigData) => apiService.put(`/api/gigs/${id}/`, gigData),
  deleteGig: (id) => apiService.delete(`/api/gigs/${id}/`),
  boostGig: (id) => apiService.post(`/api/gigs/${id}/boost/`),
  getGigRank: (id) => apiService.get(`/api/gigs/${id}/rank/`),
  getGig: (gigId) => apiService.get(`/api/gigs/${gigId}/`),
  getPredictedRank: (gigId, credits) => apiService.get(`/api/gigs/${gigId}/predicted_rank/`, { params: { credits } }),
};

export const subjectApi = {
  getSubjects: () => apiService.get('/api/subjects/'),
};

export const userApi = {
  getUser: () => apiService.get('/api/users/me/'),
  editProfile: (profileData) => apiService.post('/api/users/edit_profile/', profileData),
  uploadDp: (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return apiService.post('/api/users/upload_dp/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Credit API calls
export const creditAPI = {
  getCreditBalance: () => apiService.get(`/api/credits/`),
  getCreditHistory: (params) => apiService.get('/api/credit/history/', { params }),
  transferCredits: (transferData) => apiService.post('/api/credit/transfer/', transferData),
  getReferralCode: () => apiService.get('/api/credit/referral-code/'),
  applyReferralCode: (code) => apiService.post('/api/credit/apply-referral/', { code }),
  getEarnings: () => apiService.get('/api/credit/earnings/'),
  withdrawEarnings: (data) => apiService.post('/api/credit/withdraw/', data),
  getPendingPayments: () => apiService.get('/api/credit/pending-payments/'),
  purchaseCredits: (purchaseData) => apiService.post('/api/credits/purchase/', purchaseData),
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
  getUnreadNotifications: () => apiService.get('/api/notifications/unread/'),
  markAsRead: () => apiService.post(`/api/notifications/mark-read/`),
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
  upgradeToPremium: (planData) => apiService.post('api/users/purchase_premium/', planData),
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
