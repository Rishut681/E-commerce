import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Use Link for internal navigation
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaPaperPlane } from 'react-icons/fa';

// --- Styled Components for the Footer ---

const FooterContainer = styled.footer`
  background-color: #1a1a2e; /* Deep charcoal/dark blue background */
  color: #e0e0e0; /* Light gray text for contrast */
  padding: 60px 40px 20px;
  font-family: 'Arial', sans-serif;
  border-top: 1px solid rgba(255, 255, 255, 0.08); /* Subtle top border */
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.15); /* Subtle shadow at the top */
  position: relative; /* For any absolute positioning inside */
  z-index: 999; /* Ensure it stays above most content but below modals/navbars */

  @media (max-width: 1024px) {
    padding: 50px 30px 20px;
  }
  @media (max-width: 768px) {
    padding: 40px 20px 15px;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 2.5fr; /* Logo/Social | Company | Support | Newsletter */
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 50px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on tablets */
    gap: 30px;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Single column on mobile */
    gap: 30px;
    margin-bottom: 30px;
  }
`;

const FooterSection = styled(motion.div)`
  h4 {
    font-size: 1.3rem;
    color: #ffffff; /* White for section titles */
    margin-bottom: 25px;
    font-weight: 700;
    position: relative;
    padding-bottom: 10px;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 40px; /* Underline effect for titles */
      height: 3px;
      background-color: #6c63ff; /* Nexa purple accent */
      border-radius: 2px;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    li {
      margin-bottom: 12px;
      a {
        color: #e0e0e0;
        text-decoration: none;
        font-size: 1rem;
        transition: color 0.3s ease;
        &:hover {
          color: #6c63ff; /* Hover effect for links */
        }
      }
    }
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 20px;
  }
`;

const BrandInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align logo and text to the left */

  @media (max-width: 768px) {
    align-items: center; /* Center on mobile */
  }
`;

const FooterLogo = styled(Link)`
  font-size: 2.5rem;
  font-weight: bold;
  color: #6c63ff; /* Nexa purple for the logo */
  text-decoration: none;
  margin-bottom: 15px;
  letter-spacing: 1.5px;
  text-shadow: 1px 1px 5px rgba(0,0,0,0.3);
`;

const Tagline = styled.p`
  font-size: 1rem;
  color: #b0b0b0;
  margin-bottom: 25px;
  text-align: left; /* Align text to the left */

  @media (max-width: 768px) {
    text-align: center; /* Center on mobile */
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;

  a {
    color: #e0e0e0;
    font-size: 1.6rem;
    transition: color 0.3s ease, transform 0.2s ease;
    &:hover {
      color: #6c63ff; /* Highlight on hover */
      transform: translateY(-3px); /* Subtle lift effect */
    }
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;

  input {
    padding: 12px 15px;
    border: 1px solid #444;
    border-radius: 8px;
    background-color: #2c2c3e;
    color: #e0e0e0;
    font-size: 1rem;
    &:focus {
      outline: none;
      border-color: #6c63ff;
      box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.3);
    }
    &::placeholder {
        color: #888;
    }
  }

  button {
    background-color: #6c63ff;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background-color: #5a54d4;
      transform: translateY(-2px);
    }
    &:disabled {
        background-color: #a0a0a0;
        cursor: not-allowed;
        transform: none;
    }
  }
`;

const CopyrightBar = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #b0b0b0;

  @media (max-width: 768px) {
    margin-top: 15px;
    padding-top: 15px;
  }
`;

const LegalLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;

  a {
    color: #b0b0b0;
    text-decoration: none;
    &:hover {
      color: #6c63ff;
      text-decoration: underline;
    }
  }
`;

// --- Framer Motion Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const linkItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};


// --- WebsiteFooter Component ---
const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterMessage('');
    if (!newsletterEmail || !/\S+@\S+\.\S+/.test(newsletterEmail)) {
      setNewsletterMessage('Please enter a valid email address.');
      return;
    }

    setNewsletterLoading(true);
    // Simulate API call for newsletter subscription
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Newsletter subscribed: ${newsletterEmail}`);
    setNewsletterMessage('Thanks for subscribing!');
    setNewsletterEmail(''); // Clear input
    setNewsletterLoading(false);
  };

  return (
    <FooterContainer>
      <FooterGrid>
        {/* Section 1: Brand Info & Social Media */}
        <FooterSection
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <BrandInfo>
            <FooterLogo to="/">Nexa</FooterLogo>
            <Tagline>
              Explore innovation, connect effortlessly, and discover a world tailored to you.
            </Tagline>
            <SocialIcons>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedinIn />
              </a>
            </SocialIcons>
          </BrandInfo>
        </FooterSection>

        {/* Section 2: Company Links */}
        <FooterSection
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h4>Company</h4>
          <ul>
            <motion.li variants={linkItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Link to="/about">About Us</Link>
            </motion.li>
            <motion.li variants={linkItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Link to="/careers">Careers</Link>
            </motion.li>
            <motion.li variants={linkItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Link to="/press">Press</Link>
            </motion.li>
            <motion.li variants={linkItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Link to="/blog">Blog</Link>
            </motion.li>
          </ul>
        </FooterSection>

        {/* Section 3: Customer Service Links */}
        <FooterSection
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h4>Support</h4>
          <ul>
            <motion.li variants={linkItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Link to="/contact">Contact Us</Link>
            </motion.li>
            <motion.li variants={linkItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Link to="/faq">FAQ</Link>
            </motion.li>
            <motion.li variants={linkItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Link to="/returns">Returns & Refunds</Link>
            </motion.li>
            <motion.li variants={linkItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Link to="/shipping">Shipping Info</Link>
            </motion.li>
          </ul>
        </FooterSection>

        {/* Section 4: Newsletter Signup */}
        <FooterSection
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h4>Stay Connected</h4>
          <p>Subscribe to our newsletter for exclusive offers and updates.</p>
          <NewsletterForm onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={newsletterLoading}
            />
            <button type="submit" disabled={newsletterLoading}>
              {newsletterLoading ? (
                <>Subscribing <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /></>
              ) : (
                <>Subscribe <FaPaperPlane /></>
              )}
            </button>
            {newsletterMessage && (
              <p style={{
                fontSize: '0.85rem',
                marginTop: '10px',
                color: newsletterMessage.includes('Thanks') ? '#28a745' : '#ff6b6b' // Green for success, red for error
              }}>
                {newsletterMessage}
              </p>
            )}
          </NewsletterForm>
        </FooterSection>
      </FooterGrid>

      {/* Copyright and Legal Bar */}
      <CopyrightBar>
        © {new Date().getFullYear()} Nexa. All rights reserved.
        <LegalLinks>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/sitemap">Sitemap</Link>
        </LegalLinks>
      </CopyrightBar>
    </FooterContainer>
  );
};

export default Footer;