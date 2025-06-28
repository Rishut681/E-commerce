import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

// Keyframes for subtle background shimmer/pulse
const backgroundPulse = keyframes`
  0% { background-color: #1a1a2e; }
  50% { background-color: #2a2a40; } /* Slightly lighter/different dark shade */
  100% { background-color: #1a1a2e; }
`;

// Keyframes for a fluid, subtle blob animation (if using a blob for logo/element)
const blobMorph = keyframes`
  0%, 100% { border-radius: 40% 60% 70% 30% / 50% 50% 50% 50%; transform: rotate(0deg); }
  25% { border-radius: 70% 30% 40% 60% / 30% 70% 30% 70%; transform: rotate(10deg); }
  50% { border-radius: 60% 40% 30% 70% / 70% 30% 70% 30%; transform: rotate(-10deg); }
  75% { border-radius: 30% 70% 60% 40% / 50% 50% 50% 50%; transform: rotate(5deg); }
`;

const LoadingContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0c0c1a; /* Base dark background */
  animation: ${backgroundPulse} 5s infinite ease-in-out; /* Subtle background pulse */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: #e0e0e0;
  font-size: 2rem;
  overflow: hidden; /* Important for any animating elements that might briefly go off-canvas */
`;

const BrandElement = styled(motion.div)`
  width: 120px; /* Larger than a typical spinner */
  height: 120px;
  background: linear-gradient(45deg, #6c63ff, #ff6b6b); /* Brand gradient */
  border-radius: 50%; /* Start as a circle */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 30px;
  box-shadow: 0 0 30px rgba(108, 99, 255, 0.5); /* Subtle glow */
  animation: ${blobMorph} 8s infinite ease-in-out; /* Apply blob morph animation */
`;

const ProgressBarContainer = styled(motion.div)`
  width: 250px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background-color: #6c63ff; /* Progress color */
  border-radius: 4px;
  width: 0%; /* Start at 0% */
`;

const LoadingText = styled(motion.div)`
  font-size: 1.2rem;
  color: #c0c0c0;
  letter-spacing: 1px;
`;

const LoadingScreen = () => {
  const progressBarVariants = {
    hidden: { width: "0%" },
    visible: {
      width: "100%",
      transition: {
        duration: 2.5, // Match this to the App.js loading timeout minus exit delay
        ease: "easeInOut",
      },
    },
  };

  return (
    <LoadingContainer
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }} // Fade out after content loads
    >
      <BrandElement
        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
      >
        NEXA
        {/* Or an SVG/Icon here if you have a proper brand icon */}
      </BrandElement>

      <ProgressBarContainer>
        <ProgressBar
          variants={progressBarVariants}
          initial="hidden"
          animate="visible"
        />
      </ProgressBarContainer>

      <LoadingText
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Preparing Your Experience...
      </LoadingText>
    </LoadingContainer>
  );
};

export default LoadingScreen;