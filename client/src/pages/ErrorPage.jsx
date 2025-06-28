import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa'; // Keeping the icon for consistency, though not prominent in the image

// --- Styled Components ---

const ErrorPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Takes full viewport height */
  /* NEW: Dark background from the image */
  background-color: #0c0c1a; 
  color: #f0f0f0; /* Light text color for contrast */
  font-family: 'Arial', sans-serif;
  text-align: center;
  padding: 20px;
  overflow: hidden; /* To prevent scroll issues with animations */
`;

const ErrorContentWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 900px; /* Wider content area */
  width: 100%;
  padding: 40px 20px; /* Padding for the inner content */

  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const ErrorTitle = styled.h1`
  /* NEW: Massive 404 text with gradient from the image */
  font-size: 15rem; /* Enormous font size */
  font-weight: 900;
  margin-bottom: 0px; /* No margin below to pull up the subtitle */
  line-height: 1; /* Tightly packed line height */
  letter-spacing: -8px; /* Tighter letter spacing for impact */

  /* Gradient effect for the numbers */
  background: linear-gradient(90deg, #bb6bff 0%, #ff6e87 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  /* Subtle shadow for depth */
  text-shadow: 0px 5px 20px rgba(0, 0, 0, 0.4);

  @media (max-width: 1024px) {
    font-size: 12rem;
  }
  @media (max-width: 768px) {
    font-size: 8rem;
    letter-spacing: -4px;
  }
  @media (max-width: 480px) {
    font-size: 6rem;
    letter-spacing: -2px;
  }
`;

const Subtitle = styled.h2`
  /* NEW: "SORRY! PAGE NOT FOUND" text */
  font-size: 1.8rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-top: -20px; /* Pull it slightly over the 404 numbers */
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 2px; /* Spaced out for emphasis */

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-top: -10px;
    margin-bottom: 20px;
  }
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-top: 0px;
    margin-bottom: 15px;
  }
`;

const Description = styled.p`
  /* Existing descriptive text, adjusted for the new theme */
  font-size: 1.1rem;
  line-height: 1.8;
  color: #b0b0b0; /* Lighter grey for body text */
  margin-bottom: 50px;
  max-width: 500px; /* Constrain width for readability */

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 30px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 25px; /* Space between buttons */

  @media (max-width: 480px) {
    flex-direction: column; /* Stack buttons on small mobiles */
    gap: 15px;
  }
`;

const BaseButton = styled(motion(Link))`
  padding: 15px 35px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease, transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 12px 25px;
    font-size: 1rem;
  }
  @media (max-width: 480px) {
    width: 100%; /* Full width when stacked */
  }
`;

const ReturnHomeButton = styled(BaseButton)`
  /* Primary button style */
  background-color: #6c63ff; /* Nexa purple */
  color: white;
  border: 2px solid #6c63ff;

  &:hover {
    background-color: #5a54d4;
    border-color: #5a54d4;
  }
`;

const ReportProblemButton = styled(BaseButton)`
  /* Secondary/Ghost button style */
  background-color: transparent;
  color: #6c63ff; /* Nexa purple text */
  border: 2px solid #6c63ff;

  &:hover {
    background-color: #6c63ff;
    color: white;
  }
`;


// Framer Motion Variants - Adjusted for the new visual scale
const contentVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 10, delay: 0.1 } },
};

const textPopUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.4 } },
};

const buttonFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.7 } },
};


// --- ErrorPage Component ---
const ErrorPage = () => {
  return (
    <ErrorPageContainer>
      <ErrorContentWrapper
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <ErrorTitle>404</ErrorTitle>
        <motion.div variants={textPopUp} initial="hidden" animate="visible">
            <Subtitle>SORRY! PAGE NOT FOUND</Subtitle>
            <Description>
                Oops! It seems like the page you're trying to access doesn't exist. If you
                believe there's an issue, feel free to report it, and we'll look into it.
            </Description>
        </motion.div>
        <ButtonContainer>
            <ReturnHomeButton
                to="/home"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={buttonFadeIn}
            >
                RETURN HOME
            </ReturnHomeButton>
            <ReportProblemButton
                to="/contact" // Link to your contact page
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={buttonFadeIn}
            >
                REPORT PROBLEM
            </ReportProblemButton>
        </ButtonContainer>
      </ErrorContentWrapper>
    </ErrorPageContainer>
  );
};

export default ErrorPage;