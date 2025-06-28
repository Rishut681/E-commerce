import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './store/auth';

// Import Components
import GlobalStyles from './GlobalStyles';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // Import the new SignupPage
import DashboardPage from './pages/DashboardPage';
import ContactPage from './pages/ContactPage';
import ErrorPage from './pages/ErrorPage'

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

// Inner component that will consume the AuthContext and define routes
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  // Access isLoadingAuth from the AuthContext. This hook must be called
  // inside a component that is a child of AuthProvider.
  const { isLoadingAuth } = useAuth(); 

  // Combine app-specific loading with authentication context loading
  const showGlobalLoading = isLoading || isLoadingAuth;

  useEffect(() => {
    // Simulate any app-specific initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust loading time as needed or remove if no app-specific initial data fetch
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageWrapper>
      <AnimatePresence>
        {/* Show loading screen if either app-specific or auth context is loading */}
        {showGlobalLoading && <LoadingScreen />}
      </AnimatePresence>

      {/* Only render actual routes when everything has finished loading */}
      {!showGlobalLoading && (
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Authenticated/Dashboard Routes */}
          {/* DashboardNavbar and Footer should be integrated into these pages */}
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Fallback for any unmatched routes */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      )}
    </PageWrapper>
  );
}

function App() {
  return (
    <Router>
      <GlobalStyles /> {/* Apply global styles */}
      <AuthProvider> {/* Make authentication context available to AppContent */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
}


export default App;