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
  background-color: #f0f2f5; /* A light, neutral background */
  font-family: 'Arial', sans-serif; /* Ensuring a consistent font */
  overflow: hidden; /* Prevent scroll issues from animations */

  @media (max-width: 768px) {
    flex-direction: column; /* Stack vertically on smaller screens */
  }
`;

const LeftPanel = styled(motion.div)`
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
  text-align: center; /* Center text on the left panel */

  @media (max-width: 768px) {
    min-height: 250px; /* Ensure it has height on mobile */
    padding: 30px;
  }
`;

const LeftPanelContent = styled.div`
  z-index: 10; /* Ensure content is above abstract background */
  position: relative; /* Ensure content is positioned correctly */
`;

const LeftPanelTitle = styled(motion.h1)`
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

const LeftPanelSubtitle = styled(motion.p)`
  font-size: 1.3rem;
  line-height: 1.6;
  max-width: 500px; /* Adjusted from previous version for consistency */
  opacity: 0.9;
  margin: 0 auto; /* Center subtitle */

  @media (max-width: 1024px) {
    font-size: 1.1rem;
  }
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Styled component for individual grid items
const GridItem = styled(motion.div)`
  width: 200px; /* Size of each square */
  height: 200px;
  background-color: rgba(255, 255, 255, 0.15); /* Semi-transparent white */
  border-radius: 32px; /* Slightly rounded corners */
  box-shadow: 10px 10px rgba(72, 45, 45, 0.26);
`;

// Wrapper for the grid pattern
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


const RightPanel = styled.div`
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

// Subtitle component below the AuthTitle
const AuthSubtitleBelowTitle = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 30px; /* Space between subtitle and first input */
  text-align: center;
`;

// Styled component for the divider line
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

// Framer Motion Variants
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

const leftPanelVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 20, delay: 0.2 } },
};

const rightPanelVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 20, delay: 0.4 } },
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Variants for individual grid items within the GridContainer
const gridItemVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
};


// --- SignupPage Component ---

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '' // Used for client-side comparison, not sent to backend
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Start loading

    const { name, email, password, confirmPassword } = formData;

    // --- Client-side validation (BEFORE sending to backend) ---
    if (!name || name.length < 3) {
      setError('Full Name is required and must be at least 3 characters long.');
      setLoading(false);
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email) || email.length < 3 || email.length > 30) {
      setError('Please enter a valid email address (3-30 characters).');
      setLoading(false);
      return;
    }
    if (!password || password.length < 8 || password.length > 30) {
      setError('Password is required and must be between 8 and 30 characters long.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    // --- End Client-side validation ---

    try {
      // --- Actual Backend API Call ---
      // Send only the data your backend expects for registration: name, email, password
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }), // Send only required fields
      });

      const responseData = await response.json(); // Parse the JSON response from the server

      if (response.ok) { // Check if the response status is in the 200-299 range
        console.log('Backend signup successful:', responseData);
        toast(responseData.msg || 'Signup successful! You can now log in.'); 
        // Automatically log in the user after successful registration
        if (responseData.token && responseData.userID) {
          login(responseData.token, responseData.userID); // NEW: Use context login function
          navigate('/home'); // Redirect to home/dashboard
        } else {
            // If backend doesn't return token/userID immediately, still redirect to login
            navigate('/login');
        }
      } else {
        // Handle server-side errors
        console.error('Signup failed (backend response):', responseData);
        if (response.status === 400 && responseData === "user already exist") {
            setError("User with this email already exists. Please try logging in.");
        } else if (responseData.extraDetails) { // For Zod validation errors from your validate-middleware
            setError(responseData.extraDetails);
        } else if (responseData.message) { // For other structured errors from your error-middleware
            setError(responseData.message);
        } else {
            setError('An unexpected error occurred during signup. Please try again.');
        }
      }
    } catch (apiError) {
      // Handle network errors (e.g., server not running, no internet)
      console.error('Network or API call error:', apiError);
      setError('Could not connect to the server. Please check your network or try again later.');
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  return (
    <AuthPageWrapper>
      {/* Left Panel: Dynamic background and welcoming message */}
      <LeftPanel
        variants={leftPanelVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Grid Background (replaces previous abstract shapes) */}
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

        {/* Content on the left panel */}
        <LeftPanelContent>
          <LeftPanelTitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Your Shopping Journey, Amplified.
          </LeftPanelTitle>
          <LeftPanelSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Join a vibrant community built for seamless discovery and personalized experiences.
            Create your account to unlock deals, favorites, and a store made just for you.
          </LeftPanelSubtitle>
        </LeftPanelContent>
      </LeftPanel>

      {/* Right Panel: Signup Form */}
      <RightPanel>
        <AuthBox
          variants={rightPanelVariants}
          initial="hidden"
          animate="visible"
        >
          <AuthTitle>Create Your Account</AuthTitle>
          <AuthSubtitleBelowTitle>
            Sign up and step into a world of exclusive deals.
          </AuthSubtitleBelowTitle>
          <AuthTitleDivider /> {/* Divider below subtitle */}
          <Form onSubmit={handleSignup}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <motion.div variants={formItemVariants}>
              <InputGroup>
                <InputField
                  type="text"
                  placeholder="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </InputGroup>
            </motion.div>
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
                  autoComplete="email" // Changed to 'email' for better standard compliance
                />
              </InputGroup>
            </motion.div>
            <motion.div variants={formItemVariants}>
              <InputGroup>
                <InputField
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (8-30 chars)"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password" // Correct for new password
                />
                <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputGroup>
            </motion.div>
            <motion.div variants={formItemVariants}>
              <InputGroup>
                <InputField
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password" // Correct for confirming new password
                />
                <PasswordToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputGroup>
            </motion.div>
            <motion.div variants={formItemVariants}>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    Creating Account <Spinner />
                  </>
                ) : (
                  'Create Account & Start Exploring'
                )}
              </SubmitButton>
            </motion.div>
          </Form>
          <LinkText>
            Already have an account?{' '}
            <StyledLink onClick={() => !loading && navigate('/login')}>Log In</StyledLink>
          </LinkText>
        </AuthBox>
      </RightPanel>
    </AuthPageWrapper>
  );
};

export default SignupPage;