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
  const [userData, setUserData] = useState(null); // NEW: State to store fetched user data
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();

  // Function to handle user login
  const login = useCallback((token, id) => {
    setAuthToken(token);
    setUserID(id);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userID', id);
    console.log('User logged in:', { token, id });
    // No need to call fetchUserData here directly, the useEffect below will trigger
  }, []);

  // Function to handle user logout
  const logout = useCallback(() => {
    setAuthToken(null);
    setUserID(null);
    setUserData(null); // NEW: Clear user data on logout
    // Removed alert("Logout Successfully") as per best practices
    localStorage.removeItem('authToken');
    localStorage.removeItem('userID');
    console.log('User logged out.');
    navigate('/'); // Changed to redirect to the main landing page as discussed
  }, [navigate]);

  // Effect to check auth status on initial load (existing necessary useEffect)
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserID = localStorage.getItem('userID');

    if (storedToken && storedUserID) {
      setAuthToken(storedToken);
      setUserID(storedUserID);
      console.log('AuthContext initialized from localStorage.');
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userID');
      setAuthToken(null);
      setUserID(null);
    }
    // setIsLoadingAuth(false); // We'll set this after user data is fetched, if a token exists
  }, []); // Empty dependency array, runs once on mount


  // NEW: useEffect for JWT authentication to get user data
  useEffect(() => {
    const fetchUserData = async () => {
      // Only attempt to fetch user data if an authToken exists
      if (authToken) {
        try {
          setIsLoadingAuth(true); // Start loading for user data fetch
          const response = await fetch('http://localhost:5000/api/auth/user', { 
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`, // Send the JWT token
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserData(data.userData); 
            setUserID(data.userData.userID);
            console.log('User data fetched:', data.userData);
          } else {
            // Handle cases where token is invalid/expired during data fetch
            console.error('Failed to fetch user data:', response.status, response.statusText);
            // If token is invalid/expired, automatically log out the user
            logout(); // Use the logout function from this context
          }
        } catch (error) {
          console.error('Network error during user data fetch:', error);
          // If there's a network error, also log out or show a relevant message
          // For now, let's just logout as the token might be stale or connection lost
          logout(); 
        } finally {
          setIsLoadingAuth(false); // Loading complete (success or failure)
        }
      } else {
        // If no authToken, set userData to null and stop loading
        setUserData(null);
        setIsLoadingAuth(false);
      }
    };

    fetchUserData();
  }, [authToken, logout]); // Re-run this effect if authToken changes, or if logout function changes (unlikely)


  // The value that will be provided to consumers of this context
  const contextValue = {
    authToken,
    userID,
    userData, // NEW: Expose userData
    isLoggedIn: !!authToken,
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