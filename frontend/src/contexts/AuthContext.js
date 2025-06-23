// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   useEffect(() => {
//     if (token) {
//       fetchUserProfile();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const fetchUserProfile = async () => {
//     try {
//       const response = await fetch('/api/auth/user/', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const userData = await response.json();
//         setUser(userData);
//       } else {
//         // Token might be invalid
//         logout();
//       }
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await fetch('/api/auth/login/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         localStorage.setItem('token', data.token);
//         setToken(data.token);
//         setUser(data.user);
//         return { success: true };
//       } else {
//         const error = await response.json();
//         return { success: false, error: error.message || 'Login failed' };
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       return { success: false, error: 'Network error occurred' };
//     }
//   };

//   const googleLogin = async (tokenId) => {
//     try {
//       const response = await fetch('/api/auth/google-login/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ token_id: tokenId }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         localStorage.setItem('token', data.token);
//         setToken(data.token);
//         setUser(data.user);
//         return { success: true };
//       } else {
//         const error = await response.json();
//         return { success: false, error: error.message || 'Google login failed' };
//       }
//     } catch (error) {
//       console.error('Google login error:', error);
//       return { success: false, error: 'Network error occurred' };
//     }
//   };

//   const signup = async (userData) => {
//     try {
//       const response = await fetch('/api/auth/signup/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         localStorage.setItem('token', data.token);
//         setToken(data.token);
//         setUser(data.user);
//         return { success: true };
//       } else {
//         const error = await response.json();
//         return { success: false, error: error.message || 'Signup failed' };
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       return { success: false, error: 'Network error occurred' };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//     setUser(null);
//   };

//   const updateProfile = async (profileData) => {
//     try {
//       const response = await fetch('/api/auth/user/', {
//         method: 'PATCH',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(profileData),
//       });

//       if (response.ok) {
//         const updatedUser = await response.json();
//         setUser(updatedUser);
//         return { success: true };
//       } else {
//         const error = await response.json();
//         return { success: false, error: error.message || 'Profile update failed' };
//       }
//     } catch (error) {
//       console.error('Profile update error:', error);
//       return { success: false, error: 'Network error occurred' };
//     }
//   };

//   const value = {
//     user,
//     loading,
//     token,
//     login,
//     googleLogin,
//     signup,
//     logout,
//     updateProfile,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
