import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// --- Styled Components (No changes to these, just for context) ---

const HomePageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #f0f2f5;
  overflow: hidden;
`;

const NavWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const Logo = styled(motion.div)`
  font-size: 1.8rem;
  font-weight: bold;
  color: #6c63ff;
  cursor: pointer;
  letter-spacing: 1px;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const LoginButton = styled(motion.button)`
  background: none;
  border: 2px solid #6c63ff;
  color: #6c63ff;
  padding: 10px 25px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  &:hover {
    background-color: #6c63ff;
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
  }
  @media (max-width: 768px) {
    padding: 8px 18px;
    font-size: 0.9rem;
  }
`;

const HeroContainer = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: left;
  padding: 120px 40px 50px;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 80px);

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
    padding: 120px 20px 50px;
  }
`;

const TextContent = styled.div`
  flex: 1;
  max-width: 700px;
  margin-right: 50px;
  @media (max-width: 1024px) {
    margin-right: 0;
    margin-bottom: 40px;
    max-width: 100%;
  }
`;

const Headline = styled(motion.h1)`
  font-size: 4rem;
  margin-bottom: 20px;
  color: #222;
  line-height: 1.1;
  @media (max-width: 1024px) {
    font-size: 3rem;
  }
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const SubText = styled(motion.p)`
  font-size: 1.3rem;
  color: #555;
  max-width: 800px;
  margin-bottom: 50px;
  line-height: 1.5;
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }
`;

const ContinueButton = styled(motion.button)`
  background-color: #ff6b6b;
  color: white;
  padding: 18px 50px;
  border: none;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  font-weight: 700;
  letter-spacing: 0.5px;
  z-index: 2;

  &:hover {
    background-color: #e05c5c;
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 12px 30px rgba(255, 107, 107, 0.6);
  }
  &:active {
    transform: translateY(-2px) scale(0.98);
  }
  @media (max-width: 768px) {
    padding: 15px 35px;
    font-size: 1.2rem;
  }
`;

const BenefitSection = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 60px;
  padding: 0 20px;
  max-width: 1000px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 25px;
    margin-top: 40px;
  }
`;

const BenefitItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
  @media (max-width: 768px) {
    justify-content: center;
    font-size: 1rem;
  }
`;

const Icon = styled.span`
  font-size: 1.8rem;
  color: #6c63ff;
`;

const RightVisualContainer = styled(motion.div)`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 300px;
  @media (max-width: 1024px) {
    min-height: 250px;
    width: 80%;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const AbstractProductVisual = styled(motion.div)`
  width: clamp(200px, 30vw, 450px);
  height: clamp(200px, 30vw, 450px);
  background: linear-gradient(135deg, #6c63ff 0%, #ff6b6b 100%);
  border-radius: 40% 60% 70% 30% / 50% 50% 50% 50%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: white;
  text-shadow: 0 2px 5px rgba(0,0,0,0.2);

  &::before, &::after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    filter: blur(15px);
  }
  &::before {
    width: 60%;
    height: 60%;
    top: 15%;
    left: 15%;
  }
  &::after {
    width: 40%;
    height: 40%;
    bottom: 10%;
    right: 10%;
  }
`;

const LeftSideAnimationContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
`;

const AnimatedSphere = styled(motion.div)`
  position: absolute;
  background-color: #6c63ff;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(50px);
`;

const AnimatedCube = styled(motion.div)`
  position: absolute;
  background-color: #ff6b6b;
  opacity: 0.1;
  filter: blur(40px);
`;

const AnimatedLine = styled(motion.div)`
  position: absolute;
  background-color: #6c63ff;
  opacity: 0.2;
  border-radius: 2px;
`;


// --- MAIN COMPONENT ---

const HomePage = () => { // Removed props (onLoginClick, onContinueShopping)
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleContinueShopping = () => {
    navigate('/login'); // Direct navigation
  };

  const handleLogin = () => {
    navigate('/login'); // Direct navigation
  };

  return (
    <HomePageWrapper>
      {/* Navbar */}
      <NavWrapper>
        <Logo
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')} // Navigate to homepage root if logo clicked
        >
          Nexa
        </Logo>
        <LoginButton
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin} // Use local handleLogin
        >
          Login
        </LoginButton>
      </NavWrapper>

      <HeroContainer>
        {/* Left Side Advanced Animation (Background) */}
        <LeftSideAnimationContainer>
          <AnimatedSphere
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.15, 0.3, 0.15],
              scale: [0.8, 1.2, 0.8],
              x: ['10%', '15%', '10%'],
              y: ['20%', '25%', '20%']
            }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror"
            }}
            style={{ width: 'clamp(100px, 15vw, 200px)', height: 'clamp(100px, 15vw, 200px)', top: '10%', left: '5%' }}
          />
          <AnimatedCube
            initial={{ opacity: 0, rotate: 0 }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 90, 180, 270, 360],
              x: ['-5%', '0%', '-5%'],
              y: ['50%', '55%', '50%']
            }}
            transition={{
              duration: 12,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop"
            }}
            style={{ width: 'clamp(80px, 10vw, 150px)', height: 'clamp(80px, 10vw, 150px)', top: '40%', left: '2%' }}
          />
          <AnimatedSphere
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.1, 0.25, 0.1],
              scale: [0.6, 1.1, 0.6],
              x: ['5%', '8%', '5%'],
              y: ['70%', '75%', '70%']
            }}
            transition={{
              duration: 9,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror"
            }}
            style={{ width: 'clamp(60px, 8vw, 120px)', height: 'clamp(60px, 8vw, 120px)', top: '65%', left: '8%' }}
          />
           <AnimatedLine
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{
              opacity: [0.2, 0.3, 0.2],
              scaleX: [0.5, 1, 0.5],
              y: ['30%', '35%', '30%'],
              rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360]
            }}
            transition={{
              duration: 7,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror"
            }}
            style={{ width: 'clamp(150px, 20vw, 250px)', height: '4px', top: '25%', left: '5%' }}
          />
          <AnimatedLine
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{
              opacity: [0.1, 0.25, 0.1],
              scaleY: [0.6, 1.2, 0.6],
              x: ['10%', '12%', '10%'],
              rotate: [0, -45, -90, -135, -180, -225, -270, -315, -360]
            }}
            transition={{
              duration: 9,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror"
            }}
            style={{ width: '4px', height: 'clamp(100px, 15vw, 200px)', top: '55%', left: '15%' }}
          />

        </LeftSideAnimationContainer>

        {/* Text Content */}
        <TextContent>
          <Headline
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            Unlock a World of Curated Excellence.
          </Headline>
          <SubText
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          >
            Sign in to access personalized collections, exclusive deals, and a seamless shopping experience.
          </SubText>

          <ContinueButton
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, type: "spring", stiffness: 100, damping: 10 }}
            whileHover={{ scale: 1.05, boxShadow: '0 12px 30px rgba(255, 107, 107, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinueShopping} // Use local handleContinueShopping
          >
            Start Your Shopping Journey
          </ContinueButton>

          {/* Benefit Teasers */}
          <BenefitSection
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2, ease: "easeOut" }}
          >
            <BenefitItem
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <Icon>&#9733;</Icon> Personalized Picks
            </BenefitItem>
            <BenefitItem
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4 }}
            >
              <Icon>&#128176;</Icon> Exclusive Offers
            </BenefitItem>
            <BenefitItem
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6 }}
            >
              <Icon>&#9989;</Icon> Seamless Checkout
            </BenefitItem>
          </BenefitSection>
        </TextContent>

        {/* Right Side Visual Element */}
        <RightVisualContainer
          initial={{ opacity: 0, x: 100, rotateY: 90 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1.2, delay: 1, ease: "easeOut", type: "spring", stiffness: 80 }}
        >
          <AbstractProductVisual
            animate={{
              borderRadius: ["40% 60% 70% 30% / 50% 50% 50% 50%", "60% 40% 30% 70% / 70% 30% 70% 30%", "40% 60% 70% 30% / 50% 50% 50% 50%"],
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 15,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror"
            }}
          >
            NEXA
          </AbstractProductVisual>
        </RightVisualContainer>

      </HeroContainer>
    </HomePageWrapper>
  );
};

export default HomePage;