import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import DashboardNavbar from '../components/DashboardNavbar'; // Import the DashboardNavbar component
import { toast } from "react-toastify";

// --- New Styled Component for Page Layout ---
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100vh; /* Ensures the container takes full viewport height */
  background-color: #f0f2f5; /* Base background for the whole page */
`;

// --- Modified AuthPageWrapper (no longer takes full min-height) ---
const AuthPageWrapper = styled.div`
  display: flex;
  flex: 1; /* This makes it take up all available vertical space after the Navbar */
  font-family: 'Arial', sans-serif;
  overflow: hidden; /* Prevent scroll issues from animations */

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// --- Reused Styled Components (from previous versions for consistency) ---
const ContactInfoPanel = styled(motion.div)`
  flex: 1;
  background: linear-gradient(135deg, #6c63ff 0%, #3a2cdb 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 40px;
  position: relative;
  overflow: hidden;
  text-align: center;

  @media (max-width: 768px) {
    min-height: 250px;
    padding: 30px;
  }
`;

const ContactInfoContent = styled.div`
  z-index: 10;
  position: relative;
  max-width: 450px;
  margin: 0 auto;
`;

const InfoTitle = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.2);
`;

const InfoSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 40px;
`;

const ContactDetailItem = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 1.1rem;
  text-align: left;
`;

const ContactIcon = styled.span`
  margin-right: 15px;
  font-size: 1.8rem;
  color: #fff;
  filter: drop-shadow(0 0 5px rgba(0,0,0,0.2));
`;

const ContactText = styled.p`
  margin: 0;
  a {
    color: white;
    text-decoration: underline;
    &:hover {
      opacity: 0.8;
    }
  }
`;

const ContactFormPanel = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #ffffff;

  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const AuthBox = styled(motion.div)`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;

  @media (max-width: 768px) {
    padding: 30px;
    box-shadow: none;
  }
`;

const AuthTitle = styled.h2`
  margin-bottom: 5px;
  color: #6c63ff;
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
`;

const AuthSubtitleBelowTitle = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 30px;
  text-align: center;
`;

const AuthTitleDivider = styled.div`
  width: 60px;
  height: 4px;
  background-color: #6c63ff;
  border-radius: 2px;
  margin-bottom: 30px;
  margin-top: 5px;
  opacity: 0.8;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 25px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 15px 15px;
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

const TextAreaField = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  &:focus {
    border-color: #6c63ff;
    box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.2);
    outline: none;
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
const panelVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 20, delay: 0.2 } },
};

const formItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const detailItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
};


// --- ContactPage Component ---

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        const { name, email, message } = formData;

        if (!name || name.trim().length < 3) {
            setError('Your name is required and must be at least 3 characters long.');
            setLoading(false);
            return;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }
        if (!message || message.trim().length < 10) {
            setError('Your message is required and must be at least 10 characters long.');
            setLoading(false);
            return;
        }

        try {
          const response = await fetch(`https://e-commerce-44nm.onrender.com/api/form/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData), // Send all form data matching schema
          });
    
          const responseData = await response.json();
    
          if (response.ok) {
            toast.success('Message sent successfully!');
            console.log('Message sent successfully:', responseData);
            setSuccess(true); // Show success message
            setFormData({ name: '', email: '', subject: '', message: '' }); // Clear the form
          } else {
            toast.error('Submission failed.');
            console.error('Submission failed:', responseData);
            // Adapt error message parsing based on your backend's actual error response structure
            if (responseData.extraDetails) {
                setError(responseData.extraDetails); // From validate-middleware
            } else if (responseData.message) {
                setError(responseData.message); // General error message
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
          }
        } catch (apiError) {
          console.error('Network or API call error:', apiError);
          setError('Could not connect to the server. Please check your network or try again later.');
        } finally {
          setLoading(false);
        }
        
    };

    return (
        <PageContainer>
            <DashboardNavbar /> {/* The DashboardNavbar component is now included here */}

            <AuthPageWrapper>
                {/* Left Panel: Contact Information */}
                <ContactInfoPanel
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <ContactInfoContent>
                        <InfoTitle
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            Reach Out to Us!
                        </InfoTitle>
                        <InfoSubtitle
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            Have questions, feedback, or need assistance? We're here to help you every step of the way. Connect with our team.
                        </InfoSubtitle>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } } }}
                        >
                            <ContactDetailItem variants={detailItemVariants}>
                                <ContactIcon><FaMapMarkerAlt /></ContactIcon>
                                <ContactText>
                                    123 Nexa Plaza, Suite 400 <br />
                                    Innovation City, TX 78701
                                </ContactText>
                            </ContactDetailItem>

                            <ContactDetailItem variants={detailItemVariants}>
                                <ContactIcon><FaPhone /></ContactIcon>
                                <ContactText>
                                    <a href="tel:+18001234567">+1 (800) 123-4567</a>
                                </ContactText>
                            </ContactDetailItem>

                            <ContactDetailItem variants={detailItemVariants}>
                                <ContactIcon><FaEnvelope /></ContactIcon>
                                <ContactText>
                                    <a href="mailto:support@nexa.com">support@nexa.com</a>
                                </ContactText>
                            </ContactDetailItem>
                        </motion.div>
                    </ContactInfoContent>
                </ContactInfoPanel>

                {/* Right Panel: Contact Form */}
                <ContactFormPanel>
                    <AuthBox
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AuthTitle>Send Us a Message</AuthTitle>
                        <AuthSubtitleBelowTitle>
                            Fill out the form below and we'll get back to you shortly.
                        </AuthSubtitleBelowTitle>
                        <AuthTitleDivider />

                        <Form onSubmit={handleSubmit}>
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                            {success && <ErrorMessage style={{ color: '#28a745' }}>Message sent successfully! We'll be in touch soon.</ErrorMessage>}

                            <motion.div variants={formItemVariants}>
                                <InputGroup>
                                    <InputField
                                        type="text"
                                        placeholder="Your Full Name"
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
                                        placeholder="Your Email Address"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        autoComplete="email"
                                    />
                                </InputGroup>
                            </motion.div>
                            <motion.div variants={formItemVariants}>
                                <InputGroup>
                                    <InputField
                                        type="text"
                                        placeholder="Subject (e.g., General Inquiry, Technical Support)"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="off"
                                    />
                                </InputGroup>
                            </motion.div>
                            <motion.div variants={formItemVariants}>
                                <InputGroup>
                                    <TextAreaField
                                        placeholder="Your Message (minimum 10 characters)"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </InputGroup>
                            </motion.div>

                            <motion.div variants={formItemVariants}>
                                <SubmitButton type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            Sending Message <Spinner />
                                        </>
                                    ) : (
                                        'Send Message'
                                    )}
                                </SubmitButton>
                            </motion.div>
                        </Form>
                    </AuthBox>
                </ContactFormPanel>
            </AuthPageWrapper>
        </PageContainer>
    );
};

export default ContactPage;