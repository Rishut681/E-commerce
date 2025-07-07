import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';

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
  const [userData, setUserData] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [cartCount, setCartCount] = useState(0); // State for cart item count
  const navigate = useNavigate();

  // Function to handle user login
  const login = useCallback((token, id, initialUserData = null) => {
    setAuthToken(token);
    setUserID(id);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userID', id);
    if (initialUserData) {
        setUserData(initialUserData);
    }
    console.log('User logged in:', { token, id, initialUserData });
  }, []);

  // Function to handle user logout
  const logout = useCallback(() => {
    setAuthToken(null);
    setUserID(null);
    setUserData(null);
    setCartCount(0); // Clear cart count on logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('userID');
    console.log('User logged out.');
    navigate('/');
  }, [navigate]);

  // Function to fetch cart count
  const fetchCartCount = useCallback(async () => {
    if (!authToken) {
      setCartCount(0);
      return;
    }
    try {
      // Changed endpoint from /api/user/cart to /api/cart
      const response = await fetch('http://localhost:5000/api/cart', { 
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.cart && data.cart.items) {
        setCartCount(data.cart.items.length);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count in AuthProvider:', error);
      setCartCount(0);
    }
  }, [authToken]);


  // Effect 1: Hydrate auth state from localStorage on initial load
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
  }, []);


  // Effect 2: Fetch user data from backend when authToken changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (authToken) {
        try {
          setIsLoadingAuth(true); 
          const response = await fetch('http://localhost:5000/api/auth/user', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data) { 
                setUserData(data); 
                setUserID(data._id); 
                fetchCartCount(); // Fetch cart count after user data is loaded
            } else {
                console.error('AuthContext: User data missing in API response:', data);
                logout(); 
            }
          } else {
            console.error('Failed to fetch user data:', response.status, response.statusText);
            logout(); 
          }
        } catch (error) {
          console.error('Network error during user data fetch:', error);
          logout(); 
        } finally {
          setIsLoadingAuth(false); 
        }
      } else {
        setUserData(null);
        setIsLoadingAuth(false);
      }
    };

    fetchUserData();
  }, [authToken, logout, fetchCartCount]); // Add fetchCartCount to dependencies

  // The value that will be provided to consumers of this context
  const contextValue = {
    authToken,
    userID,
    userData, 
    isLoggedIn: !!authToken, 
    login,
    logout,
    isLoadingAuth,
    cartCount,      // Expose cartCount
    fetchCartCount, // Expose fetchCartCount function
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Admin Protected Route component, exported from auth.js
export const AdminProtectedRoute = ({ children }) => {
  const { isLoggedIn, userData, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn || !userData || userData.role !== 'admin') {
    return <Navigate to="/home" replace />; 
  }

  return children;
};
