import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../store/auth';
import { toast } from "react-toastify";

// --- Styled Components ---

const AuthPageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5; /* Light, neutral background */
  font-family: 'Arial', sans-serif;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column; /* Stack vertically on smaller screens */
  }
`;

// NEW: Left Panel for the FORM
const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #ffffff; /* Form background */

  @media (max-width: 768px) {
    padding: 30px;
  }
`;

// NEW: Right Panel for the VISUAL/TEXT
const RightPanel = styled(motion.div)`
  flex: 1;
  background: linear-gradient(135deg, #6c63ff 0%, #3a2cdb 100%); /* Nexa's primary purple gradient */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 40px;
  position: relative; /* For abstract elements */
  overflow: hidden; /* Hide overflow of animated elements */
  text-align: center; /* Center text on the right panel */

  @media (max-width: 768px) {
    opacity: 0;
    min-height: 250px; /* Ensure it has height on mobile */
    padding: 30px;
  }
`;

const RightPanelContent = styled.div`
  z-index: 10; /* Ensure content is above abstract background */
  position: relative; /* Ensure content is positioned correctly */
`;

const RightPanelTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.2);

  @media (max-width: 1024px) {
    font-size: 2.8rem;
  }
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const RightPanelSubtitle = styled(motion.p)`
  font-size: 1.3rem;
  line-height: 1.6;
  max-width: 450px;
  opacity: 0.9;
  margin: 0 auto; /* Center subtitle */

  @media (max-width: 1024px) {
    font-size: 1.1rem;
  }
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Styled component for individual grid items (reused from SignupPage)
const GridItem = styled(motion.div)`
  width: 200px; /* Size of each square */
  height: 200px;
  background-color: rgba(255, 255, 255, 0.15); /* Semi-transparent white */
  border-radius: 32px; /* Slightly rounded corners */
  box-shadow: 10px 10px rgba(72, 45, 45, 0.26);
`;

// Wrapper for the grid pattern (reused from SignupPage)
const GridContainer = styled(motion.div)`
  position: absolute; /* Position over the gradient background */
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
  grid-template-rows: repeat(3, 1fr); /* 3 rows */
  gap: 15px; /* Gap between grid items */
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  z-index: 5; /* Below content, above main background */
  opacity: 0.6; /* Overall opacity for the grid */

  @media (max-width: 768px) {
    display: none; /* Hide complex grid on small screens for performance/simplicity */
  }
`;


const AuthBox = styled(motion.div)`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 10px 10px 20px 20px rgba(0, 0, 0, 0.43);
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333; /* Default text color for the form */

  @media (max-width: 768px) {
    padding: 30px;
    box-shadow: none; /* Reduce shadow on small screens for a cleaner stack */
  }
`;

const AuthTitle = styled.h2`
  margin-bottom: 5px; /* Reduced margin to bring text closer to subtitle */
  color: #6c63ff;
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
`;

const AuthSubtitleBelowTitle = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 30px; /* Space between subtitle and first input */
  text-align: center;
`;

// NEW: Styled component for the divider line
const AuthTitleDivider = styled.div`
  width: 60px; /* Adjust width as desired, e.g., 60px or 30% */
  height: 4px; /* Thickness of the line */
  background-color: #6c63ff; /* Matching your primary color */
  border-radius: 2px; /* Slightly rounded ends */
  margin-bottom: 30px; /* Space between the line and the first input */
  margin-top: 5px; /* Space between the subtitle and the line */
  opacity: 0.8; /* Slightly transparent */
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 25px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 15px 45px 15px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  &:focus {
    border-color: #6c63ff;
    box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.2);
    outline: none;
  }
`;

const PasswordToggle = styled.span`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
  font-size: 1.1rem;
  &:hover {
    color: #6c63ff;
  }
`;

const SubmitButton = styled(motion.button)`
  background-color: #6c63ff;
  color: white;
  padding: 15px 35px;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease, transform 0.2s ease;
  font-weight: 600;
  width: 100%;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:hover {
    background-color: ${props => props.disabled ? '#a0a0a0' : '#5a54d4'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-3px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 8px 20px rgba(108, 99, 255, 0.3)'};
  }
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
`;

const LinkText = styled.p`
  margin-top: 25px;
  font-size: 0.95rem;
  color: #666;
`;

const StyledLink = styled.span`
  color: #6c63ff;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
  &:hover {
    text-decoration: underline;
    color: #5a54d4;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: -15px;
  margin-bottom: 15px;
  text-align: left;
  width: 100%;
`;

const Form = styled.form`
  width: 100%;
`;

const Spinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  margin-left: 10px;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Framer Motion Variants (reused from SignupPage)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5,
    },
  },
};

const leftPanelFormVariants = { // Renamed for clarity in LoginPage
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 20, delay: 0.2 } },
};

const rightPanelVisualVariants = { // Renamed for clarity in LoginPage
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 20, delay: 0.4 } },
};

const textVariants = { // For Right Panel Title/Subtitle
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const gridItemVariants = { // For Right Panel Grid Visual
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
};


// --- LoginPage Component ---

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { email, password } = formData;

    // Client-side validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Password is required.');
      setLoading(false);
      return;
    }

    try {
      // --- Actual Backend API Call ---
      const response = await fetch('https://e-commerce-44nm.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json(); // Always parse response JSON
      
      if (response.ok) { // Status is 2xx
        console.log('Backend login successful:', responseData);
        toast(responseData.msg || 'Login successful! Welcome back.');
        
        // Use the login function from context to set token and userID
        login(responseData.token, responseData.userID);

        navigate('/home'); // Navigate to the new dashboard/home page
      } else {
        // Handle server-side errors based on your backend's response structure
        console.error('Login failed (backend response):', responseData);
        if (response.status === 400 && responseData === "Invalid credentials") {
            setError("Invalid email or password.");
        } else if (response.status === 400 && responseData === "user does not exist") { // Specific message from your backend
            setError("User does not exist. Please check your email or sign up.");
        } else if (responseData.extraDetails) { // From Zod validation errors via validate-middleware
            setError(responseData.extraDetails);
        } else if (responseData.message) { // From your general error-middleware
            setError(responseData.message);
        } else {
            setError('An unexpected error occurred during login. Please try again.');
        }
      }
    } catch (apiError) {
      // Handle network errors
      console.error('Network or API call error:', apiError);
      setError('Could not connect to the server. Please check your network or try again later.');
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  return (
    <AuthPageWrapper>
      {/* Left Panel: Login Form */}
      <LeftPanel>
        <AuthBox
          variants={leftPanelFormVariants}
          initial="hidden"
          animate="visible"
        >
          <AuthTitle>Welcome Back!</AuthTitle>
          <AuthSubtitleBelowTitle>
            Login to continue your shopping adventure.
          </AuthSubtitleBelowTitle>
          <AuthTitleDivider /> {/* Divider below subtitle */}

          <Form onSubmit={handleLogin}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <motion.div variants={formItemVariants}>
              <InputGroup>
                <InputField
                  type="email"
                  placeholder="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="email" // Changed from username to email for better standard compliance
                />
              </InputGroup>
            </motion.div>
            <motion.div variants={formItemVariants}>
              <InputGroup>
                <InputField
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password" // Correct for current login password
                />
                <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputGroup>
            </motion.div>
            <motion.div variants={formItemVariants}>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    Logging In <Spinner />
                  </>
                ) : (
                  'Securely Log In' // Adjusted button text
                )}
              </SubmitButton>
            </motion.div>
          </Form>
          <LinkText>
            Don't have an account?{' '}
            <StyledLink onClick={() => !loading && navigate('/signup')}>Sign Up</StyledLink>
          </LinkText>
        </AuthBox>
      </LeftPanel>

      {/* Right Panel: Dynamic background and welcoming message */}
      <RightPanel
        variants={rightPanelVisualVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Grid Background */}
        <GridContainer
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.8 } } }}
        >
          {/* Render 9 grid items for a 3x3 pattern */}
          {[...Array(9)].map((_, i) => (
            <GridItem key={i} variants={gridItemVariants} />
          ))}
        </GridContainer>

        {/* Content on the right panel */}
        <RightPanelContent>
          <RightPanelTitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Reconnect with Nexa.
          </RightPanelTitle>
          <RightPanelSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Welcome back! Dive into your personalized world of products, track your orders, and enjoy exclusive member benefits.
          </RightPanelSubtitle>
        </RightPanelContent>
      </RightPanel>
    </AuthPageWrapper>
  );
};

export default LoginPage;