import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Authenticating() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) {
      setMessage('Token expired or not found');
      return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}/auth/${token}`)
      .then(response => {
        console.log(response);
        if (response.data.success) {
          localStorage.setItem('token', token);
          setTimeout(() => {
            navigate('/result');
          }, 500);
        } else {
          setMessage('Token is invalid');
        }
      })
      .catch(error => {
        console.error('Error validating token:', error);
        setMessage('Invalid Token');
      });
  }, [navigate]);

  return (
    <div>
      <div className="relative z-50">
      </div>
      <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="text-center">
        {message ? (
          <p className="text-red-600 text-3xl font-bold">{message}</p>
        ) : (
          <>
            <svg className="animate-spin h-10 w-10 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.001 8.001 0 0112 4.472v3.67a4.002 4.002 0 00-4 4.04h3.545zm1.015 2.458A8.044 8.044 0 0112 19.528v-3.689a4.001 4.001 0 004 4.04h3.545zm2.458-1.015A8.044 8.044 0 0119.528 12h-3.689a4.001 4.001 0 00-4-4.04v3.67zm1.015-2.458A8.001 8.001 0 0120.528 12h3.67a8 8 0 01-8 8v-4zM4.472 12a8 8 0 018-8v4a4 4 0 00-4 4H4.472zM12 4.472a8 8 0 00-8 8h4a4 4 0 014-4V4.472zm-1.015 13.265A8.044 8.044 0 004.472 12h3.689a4.001 4.001 0 014 4.04v3.545zm2.458-1.015A8.044 8.044 0 0012 19.528v-3.689a4.001 4.001 0 01-4-4.04h-3.545zm2.458-1.015A8.044 8.044 0 0019.528 12h-3.689a4.001 4.001 0 00-4-4.04v-3.545zm1.015 2.458A8.044 8.044 0 0120.528 12h3.67a8 8 0 01-8 8v-4zM4.472 12a8 8 0 018-8v4a4 4 0 00-4 4H4.472z"></path>
            </svg>
            <p className="text-gray-700 text-lg mt-4">Authenticating...</p>
          </>
        )}
      </div>
    </div>
    </div>
  );
}