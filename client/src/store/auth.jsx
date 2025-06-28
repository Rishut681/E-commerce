import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the AuthContext
const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [userID, setUserID] = useState(localStorage.getItem('userID') || null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // To indicate if initial auth check is done
  const navigate = useNavigate();

  // Function to handle user login
  const login = useCallback((token, id) => {
    setAuthToken(token);
    setUserID(id);
    localStorage.setItem('authToken', token); // Persist token in local storage
    localStorage.setItem('userID', id);       // Persist user ID in local storage
    console.log('User logged in:', { token, id });
  }, []);

  // Function to handle user logout
  const logout = useCallback(() => {
    setAuthToken(null);
    setUserID(null);
    localStorage.removeItem('authToken'); // Remove token from local storage
    localStorage.removeItem('userID');    // Remove user ID from local storage
    console.log('User logged out.');
    navigate('/login'); // Redirect to login page after logout
  }, [navigate]);

  // Effect to check auth status on initial load
  useEffect(() => {
    // This runs once when the AuthProvider mounts
    // We already initialize state from localStorage, but this ensures consistency
    // and can be extended for token validation if your backend provides a way
    const storedToken = localStorage.getItem('authToken');
    const storedUserID = localStorage.getItem('userID');

    if (storedToken && storedUserID) {
      setAuthToken(storedToken);
      setUserID(storedUserID);
      console.log('AuthContext initialized from localStorage.');
    } else {
      // Clear any stale/incomplete data if only one was found
      localStorage.removeItem('authToken');
      localStorage.removeItem('userID');
      setAuthToken(null);
      setUserID(null);
    }
    setIsLoadingAuth(false); // Mark initial auth check as complete
  }, []);

  // The value that will be provided to consumers of this context
  const contextValue = {
    authToken,
    userID,
    isLoggedIn: !!authToken, // Derived state: true if authToken exists
    login,
    logout,
    isLoadingAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};