export const useAuth = () => {
    const isAuthenticated = !!(localStorage.getItem('token'));
    return isAuthenticated;
  };