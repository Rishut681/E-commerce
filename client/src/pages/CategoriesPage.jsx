import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBoxes, FaSpinner, FaChevronRight, // Existing icons
  FaDesktop, FaTshirt, FaHome, FaBook, FaRunning, FaCar, FaUtensils, FaUserTie, FaFemale, FaShoePrints, FaMobileAlt, FaLaptopCode, FaTv, FaHeadphonesAlt, FaGamepad, FaCameraRetro, FaGem, FaSuitcase, FaChair, FaBlender, FaBaby
} from 'react-icons/fa'; // More specific icons for categories
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

// --- Styled Components ---

const CategoriesPageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Arial', sans-serif;
`;

const MainContentWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (max-width: 768px) {
    padding: 15px;
    gap: 20px;
  }
`;

const PageHeader = styled.h1`
  font-size: 3rem; /* Larger header */
  color: #333;
  text-align: center;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px; /* More space below header */

  @media (max-width: 768px) {
    font-size: 2.5rem;
    gap: 10px;
    margin-bottom: 30px;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Slightly larger cards */
  gap: 30px; /* More space between cards */
  padding: 20px;
  background-color: #ffffff;
  border-radius: 15px; /* More rounded corners */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1); /* Stronger shadow */

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    padding: 15px;
  }
`;

const CategoryCard = styled(motion.div)`
  background-color: #f8f8f8;
  border-radius: 15px; /* More rounded */
  padding: 30px; /* More padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); /* Nicer shadow */
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px); /* More pronounced lift */
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); /* Stronger hover shadow */
    background-color: #eff2ff; /* Light purple hover */
  }

  h3 {
    font-size: 1.7rem; /* Larger title */
    color: #333;
    margin-top: 20px; /* More space below icon */
    margin-bottom: 10px;
    font-weight: 700;
  }

  span { /* for product count or sub-info */
    font-size: 0.95rem;
    color: #888;
    margin-bottom: 15px; /* Space above link */
  }

  a { /* Styled link within card */
    font-size: 1rem;
    color: #6c63ff;
    text-decoration: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.2s ease;

    &:hover {
      color: #5a54d4;
    }
  }
`;

const CategoryIcon = styled.div`
  font-size: 4.5rem; /* Larger icons */
  color: #6c63ff; 
  margin-bottom: 10px; /* Space between icon and text */
`;

const LoadingSpinner = styled(FaSpinner)`
  font-size: 3rem;
  color: #6c63ff;
  animation: spin 1s linear infinite;
  margin: 50px auto;
  display: block; 
`;

const Message = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: ${props => props.$error ? '#dc3545' : '#666'};
  padding: 50px;
`;

// --- Framer Motion Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05, // Staggered animation
      duration: 0.5,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  })
};

// Map category names to relevant icons
const categoryIconsMap = {
  'Electronics': <FaDesktop />,
  'Wearables': <FaSpinner />, // Keep a default if no specific icon
  'Home & Kitchen': <FaHome />,
  'Apparel': <FaTshirt />,
  "Men's Clothing": <FaUserTie />,
  "Women's Clothing": <FaFemale />,
  "Footwear": <FaShoePrints />,
  "Smartphones": <FaMobileAlt />,
  "Laptops": <FaLaptopCode />,
  "Televisions": <FaTv />,
  "Audio": <FaHeadphonesAlt />,
  "Books": <FaBook />,
  'Sports & Outdoors': <FaRunning />,
  'Automotive': <FaCar />,
  'Groceries': <FaUtensils />,
  'Health & Beauty': <FaGem />, // Using FaGem as a placeholder for beauty/jewelry
  'Toys & Games': <FaBaby />, // Using FaBaby as a placeholder
  'Pet Supplies': <FaSpinner />, // Placeholder
  'Furniture': <FaChair />,
  'Kitchen Appliances': <FaBlender />,
  'Gaming': <FaGamepad />,
  'Cameras': <FaCameraRetro />,
  'Jewelry': <FaGem />,
  'Bags & Luggage': <FaSuitcase />
};


// --- CategoriesPage Component ---

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/categories'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching all categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const handleCategoryClick = (categoryName) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <CategoriesPageContainer
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <DashboardNavbar />
      <MainContentWrapper>
        <PageHeader><FaBoxes /> Explore Our Categories</PageHeader>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Message $error>{error}</Message>
        ) : categories.length === 0 ? (
          <Message>No categories found.</Message>
        ) : (
          <CategoriesGrid>
            <AnimatePresence>
              {categories.map((category, index) => (
                <CategoryCard 
                  key={category._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index} // Pass index for staggered animation
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <CategoryIcon>
                    {categoryIconsMap[category.name] || <FaBoxes />} 
                  </CategoryIcon>
                  <h3>{category.name}</h3>
                  {/* Potentially add product count here if available from backend */}
                  <a onClick={(e) => { e.stopPropagation(); handleCategoryClick(category.name); }}>
                    View Products <FaChevronRight size={12} />
                  </a>
                </CategoryCard>
              ))}
            </AnimatePresence>
          </CategoriesGrid>
        )}
      </MainContentWrapper>
      <Footer />
    </CategoriesPageContainer>
  );
};

export default CategoriesPage;
