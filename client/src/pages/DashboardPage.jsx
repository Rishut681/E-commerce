import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';

// Import DashboardNavbar and Footer
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';

// Comprehensive Fa Icon Imports
import { 
  FaBoxOpen, FaDollarSign, FaShoppingCart, FaStar, FaTags, FaChartLine, 
  FaChevronRight, FaRegBell, FaUser, FaCog, FaBell, FaEnvelope, FaSearch, 
  FaHeart, FaHome, FaCreditCard, FaMapMarkerAlt, FaQuestionCircle, FaTruck,
  FaChevronLeft, // Added for carousel navigation
  // Specific icons for categories (expanded from previous versions)
  FaDesktop, FaTshirt, FaBook, FaRunning, FaCar, FaUtensils, FaUserTie, FaFemale, FaShoePrints, FaMobileAlt, FaLaptopCode, FaTv, FaHeadphonesAlt, FaGamepad, FaCameraRetro, FaGem, FaSuitcase, FaChair, FaBlender, FaBaby, FaSpinner // FaSpinner as a generic placeholder or loading
} from 'react-icons/fa';


// --- Styled Components for Dashboard Layout ---

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f0f2f5; /* Light background for the dashboard */
  font-family: 'Arial', sans-serif;
  display: flex;
  flex-direction: column;
`;

const MainContentWrapper = styled.div`
  width: 100%;
  max-width: 1400px; /* Content area max-width */
  margin: 0 auto; /* Center the content */
  padding: 30px; /* Padding inside the content wrapper */
  display: grid;
  grid-template-columns: 1fr; 
  gap: 30px; /* Gap between rows/columns */
  flex-grow: 1; /* Allows content to take up available space, pushing footer down */

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const SectionHeader = styled.h2`
  font-size: 1.8rem; /* Slightly larger section headers */
  color: #333;
  margin-bottom: 20px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
`;

// --- NEW: Styled Component for 2-column section ---
const BottomTwoColumnGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); /* Adjust minmax as needed */
  gap: 30px; /* Gap between the two cards */

  @media (max-width: 1024px) {
    grid-template-columns: 1fr; /* Stack on smaller screens */
  }
`;


// --- General Card Component ---
const Card = styled(motion.div)`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px; /* Default min height for cards */

  h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 20px;
    font-weight: 700;
  }
`;

// --- Specific Section Styles (rest remains the same) ---

const WelcomeBanner = styled(Card)`
  background: linear-gradient(135deg, #6c63ff 0%, #3a2cdb 100%);
  color: white;
  padding: 40px;
  text-align: left;
  position: relative;
  overflow: hidden; 

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 10px;
    text-shadow: 1px 1px 5px rgba(0,0,0,0.2);
  }
  p {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 70%; 
  }

  @media (max-width: 768px) {
    h1 { font-size: 2.2rem; }
    p { font-size: 1rem; max-width: 90%; }
    padding: 30px;
  }
`;

const WelcomeIllustration = styled.div`
  position: absolute;
  right: 40px;
  bottom: 20px;
  font-size: 6rem; 
  color: rgba(255, 255, 255, 0.2); 
  opacity: 0.8;
  pointer-events: none; 

  @media (max-width: 1024px) {
    font-size: 4rem;
    right: 20px;
    bottom: 10px;
  }
  @media (max-width: 768px) {
    display: none; 
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled(Card)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 120px;

  .icon {
    font-size: 2.5rem;
    color: #6c63ff;
    margin-bottom: 10px;
  }
  .value {
    font-size: 2.2rem;
    font-weight: 700;
    color: #333;
  }
  .label {
    font-size: 0.95rem;
    color: #666;
  }
`;

const RecentOrdersCard = styled(Card)`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.95rem;
    &:last-child {
      border-bottom: none;
    }
  }
  .order-id {
    font-weight: 600;
    color: #555;
  }
  .order-date {
    color: #888;
    font-size: 0.85rem;
  }
  .order-status {
    padding: 5px 10px;
    border-radius: 5px;
    font-weight: 500;
    font-size: 0.8rem;
    &.pending { background-color: #fff3cd; color: #856404; }
    &.shipped { background-color: #d1ecf1; color: #0c5460; }
    &.delivered { background-color: #d4edda; color: #155724; }
    &.cancelled { background-color: #f8d7da; color: #721c24; }
  }
  .view-all-link {
    text-align: right;
    margin-top: 20px;
    a {
      color: #6c63ff;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      &:hover {
        text-decoration: underline;
        color: #5a54d4;
      }
    }
  }
`;

// --- Product Carousel Styles ---
const ProductCarouselWrapper = styled.div`
  position: relative;
  overflow: hidden; /* Hide products outside the view */
  padding: 10px 0; /* Add some vertical padding for carousel */
`;

const ProductCarouselInner = styled(motion.div)`
  display: flex;
  gap: 25px; /* Gap between product cards */
  /* This container will be translated horizontally */
`;

const CarouselButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #6c63ff;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #6c63ff;
    color: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f0f0f0;
    color: #999;
  }

  &.left {
    left: -20px; /* Position outside the main content wrapper slightly */
  }
  &.right {
    right: -20px; /* Position outside the main content wrapper slightly */
  }

  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
    &.left { left: 5px; }
    &.right { right: 5px; }
  }
`;

const ProductCardStyled = styled(motion.div)`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  text-align: left;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer; 
  min-height: 350px; 
  flex-shrink: 0; /* Prevent shrinking in flex container */
  
  /* Responsive Width Calculation for Product Cards */
  width: calc((100% / var(--products-per-view)) - (var(--gap-count) * var(--gap-size) / var(--products-per-view)));

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  .product-info {
    padding: 20px;
    flex-grow: 1; 
    display: flex;
    flex-direction: column;
  }
  h3 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 8px;
    line-height: 1.3;
    min-height: 2.6em; 
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical;
  }
  .price {
    font-size: 1.15rem;
    color: #6c63ff;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .rating {
    color: #f39c12; 
    font-size: 0.9rem;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .add-to-cart-btn {
    background-color: #6c63ff;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;
    &:hover {
      background-color: #5a54d4;
    }
  }
`;

// --- Category Carousel Styles ---
const CategoryBrowseWrapper = styled.div`
  position: relative;
  overflow-x: auto; /* Enable horizontal scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  padding: 10px 0; /* Add some vertical padding */
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  &::-webkit-scrollbar { /* Hide scrollbar for Chrome, Safari, Opera */
    display: none;
  }
`;

const CategoryBrowseInner = styled(motion.div)`
  display: flex;
  gap: 20px; /* Gap between category cards */
  padding-bottom: 10px; /* Space for potential scrollbar area */
`;

const CategoryCard = styled(motion.div)`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0; /* Prevent shrinking */
  width: 180px; /* Fixed width for category cards */
  height: 150px; /* Fixed height for consistent look */

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .icon {
    font-size: 2.5rem;
    color: #6c63ff;
    margin-bottom: 15px;
  }
  .name {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }
`;

const PromotionBanner = styled(Card)`
  background: linear-gradient(90deg, #ff6b6b 0%, #ff8c42 100%); /* Warm gradient */
  color: white;
  padding: 30px;
  text-align: center;

  h2 {
    color: white;
    margin-bottom: 15px;
  }
  p {
    font-size: 1rem;
    opacity: 0.9;
    margin-bottom: 25px;
  }
  button {
    background-color: white;
    color: #ff6b6b;
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      background-color: #f0f2f5;
      color: #ff8c42;
      transform: translateY(-2px);
    }
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  padding: 50px;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #dc3545;
  padding: 50px;
`;

// Map category names to relevant icons (expanded to match seed data)
const categoryIconsMap = {
  'Electronics': <FaDesktop />,
  'Wearables': <FaSpinner />, // Generic spinner, consider a specific watch icon
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
  'Health & Beauty': <FaGem />, 
  'Toys & Games': <FaBaby />, 
  'Pet Supplies': <FaSpinner />, // Generic spinner
  'Furniture': <FaChair />,
  'Kitchen Appliances': <FaBlender />,
  'Gaming': <FaGamepad />,
  'Cameras': <FaCameraRetro />,
  'Jewelry': <FaGem />,
  'Bags & Luggage': <FaSuitcase />
};


// --- Framer Motion Variants ---
const sectionEnter = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.1 } },
};

const itemEnter = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
};

const carouselVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000, // Start off-screen
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 1000 : -1000, // Exit off-screen in opposite direction
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  })
};


// --- DashboardPage Component ---

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userData, isLoadingAuth } = useAuth();

  const userName = userData ? userData.name : 'Customer'; 

  // State for fetched data
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all fetched products
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [productsError, setProductsError] = useState(null);

  // Carousel state
  const [productPageIndex, setProductPageIndex] = useState(0);
  const [productsPerView, setProductsPerView] = useState(4); // Default for desktop
  const [direction, setDirection] = useState(0); // 0 for no direction, 1 for next, -1 for prev

  // Static data for metrics and recent orders (as per previous request)
  const [metrics] = useState([
    { id: 1, label: "Total Orders", value: "12", icon: <FaBoxOpen /> },
    { id: 2, label: "Pending Orders", value: "2", icon: <FaTruck /> }, 
    { id: 3, label: "Total Spent", value: "$1,250", icon: <FaDollarSign /> },
    { id: 4, label: "Wishlist Items", value: "7", icon: <FaHeart /> },
  ]);

  const [recentOrders] = useState([
    { id: 'NEXA-ORD-005', date: '2025-06-25', status: 'delivered', amount: '$75.00' },
    { id: 'NEXA-ORD-004', date: '2025-06-22', status: 'shipped', amount: '$120.50' },
    { id: 'NEXA-ORD-003', date: '2025-06-18', status: 'pending', amount: '$45.99' },
  ]);

  // --- Responsive productsPerView ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setProductsPerView(1);
      } else if (window.innerWidth <= 768) {
        setProductsPerView(2);
      } else if (window.innerWidth <= 1200) {
        setProductsPerView(3);
      } else {
        setProductsPerView(4);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // --- Fetch Categories ---
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError(null);
    try {
      const response = await fetch('http://localhost:5000/api/categories'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories for dashboard:', err);
      setCategoriesError('Failed to load categories.');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // --- Fetch All Products for Carousel (or a larger set) ---
  const fetchAllProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      // Fetch all products, or a large enough number to fill the carousel
      // For a real app, you might fetch 'featured' or 'newest' products specifically
      const response = await fetch('http://localhost:5000/api/products?sort=newest&limit=20'); // Fetch more products for carousel
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching all products for dashboard carousel:', err);
      setProductsError('Failed to load products for recommendations.');
      setAllProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, [fetchCategories, fetchAllProducts]);

  // --- Carousel Navigation Logic ---
  const paginateProducts = useCallback((newDirection) => {
    setDirection(newDirection);
    setProductPageIndex((prevIndex) => {
      const totalPages = Math.ceil(allProducts.length / productsPerView);
      let newIndex = prevIndex + newDirection;
      
      // Clamp index to valid range
      if (newIndex < 0) newIndex = 0; // Don't wrap around for simplicity, or implement full wrap if desired
      if (newIndex >= totalPages) newIndex = totalPages - 1;

      return newIndex;
    });
  }, [allProducts.length, productsPerView]);

  const startIndex = productPageIndex * productsPerView;
  const endIndex = startIndex + productsPerView;
  const currentProductsInView = allProducts.slice(startIndex, endIndex);

  // Calculate total pages for carousel
  const totalProductPages = Math.ceil(allProducts.length / productsPerView);


  const handleProductClick = (productId) => {
    // Implement navigation to product detail page if you have one
    console.log(`Navigating to product details for ID: ${productId}`);
    // navigate(`/product/${productId}`); // Example route
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <DashboardContainer>
      <DashboardNavbar />
      
      <MainContentWrapper>
        {/* Welcome Banner */}
        <WelcomeBanner
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          <h1>Welcome back, {isLoadingAuth ? '...' : userName} !</h1>
          <p>Your personalized hub for seamless shopping and order management.</p>
          <WelcomeIllustration><FaShoppingCart /></WelcomeIllustration>
        </WelcomeBanner>

        {/* Key Metrics */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          <SectionHeader>Your Activity at a Glance</SectionHeader>
          <MetricsGrid>
            {metrics.map((metric) => (
              <MetricCard key={metric.id} variants={itemEnter}>
                <div className="icon">{metric.icon}</div>
                <div className="value">{metric.value}</div>
                <div className="label">{metric.label}</div>
              </MetricCard>
            ))}
          </MetricsGrid>
        </motion.div>

        {/* Recent Orders */}
        <RecentOrdersCard
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          <SectionHeader>Recent Orders</SectionHeader>
          <ul>
            {recentOrders.map((order) => (
              <motion.li key={order.id} variants={itemEnter}>
                <div>
                  <span className="order-id">{order.id}</span>
                  <br />
                  <span className="order-date">{order.date}</span>
                </div>
                <span className={`order-status ${order.status}`}>{order.status}</span>
                <strong>{order.amount}</strong>
              </motion.li>
            ))}
          </ul>
          <div className="view-all-link">
            <a href="/orders">View All Orders <FaChevronRight style={{ verticalAlign: 'middle', fontSize: '0.9em' }}/></a>
          </div>
        </RecentOrdersCard>

        {/* Personalized Recommendations (Carousel) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          <SectionHeader>Recommended for You</SectionHeader>
          {loadingProducts ? (
            <LoadingMessage>Loading recommended products...</LoadingMessage>
          ) : productsError ? (
            <ErrorMessage>{productsError}</ErrorMessage>
          ) : allProducts.length === 0 ? (
            <LoadingMessage>No recommended products found.</LoadingMessage>
          ) : (
            <ProductCarouselWrapper>
              <AnimatePresence initial={false} custom={direction}>
                <ProductCarouselInner
                  key={productPageIndex} // Key changes to trigger re-animation on page change
                  custom={direction}
                  variants={carouselVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  // Pass CSS variables for dynamic width calculation
                  style={{ 
                    '--products-per-view': productsPerView, 
                    '--gap-size': '25px', 
                    '--gap-count': productsPerView > 1 ? (productsPerView - 1) : 0 
                  }}
                >
                  {currentProductsInView.map((product) => (
                    <ProductCardStyled 
                      key={product._id} 
                      onClick={() => handleProductClick(product._id)} 
                    >
                      <img src={product.image} alt={product.name} onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/cccccc/333333?text=No+Image"; }} />
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="price">${product.price.toFixed(2)}</p>
                        <div className="rating">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FaStar key={i} color={i < 4 ? "#f39c12" : "#e0e0e0"} /> 
                          ))} (4.0) 
                        </div>
                        <button className="add-to-cart-btn">Add to Cart</button>
                      </div>
                    </ProductCardStyled>
                  ))}
                </ProductCarouselInner>
              </AnimatePresence>
              {/* Carousel Buttons */}
              {allProducts.length > productsPerView && ( // Only show buttons if there are more products than can be displayed at once
                <>
                  <CarouselButton 
                    className="left" 
                    onClick={() => paginateProducts(-1)} 
                    disabled={productPageIndex === 0}
                  >
                    <FaChevronLeft />
                  </CarouselButton>
                  <CarouselButton 
                    className="right" 
                    onClick={() => paginateProducts(1)} 
                    disabled={productPageIndex === totalProductPages - 1}
                  >
                    <FaChevronRight />
                  </CarouselButton>
                </>
              )}
            </ProductCarouselWrapper>
          )}
        </motion.div>

        {/* NEW SECTION: Promotion Banner and User Profile next to each other */}
        <BottomTwoColumnGrid
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          {/* Promotion Banner */}
          <PromotionBanner>
            <SectionHeader>Exclusive Offer!</SectionHeader>
            <p>Don't miss out on our limited-time deals. Sign up for our newsletter to get the latest updates directly in your inbox.</p>
            <button onClick={() => navigate('/Newsletter')}>Get Started Now!</button>
          </PromotionBanner>
          
          {/* Optional: Placeholder for User Profile Summary / Quick Links */}
          <Card> 
            <SectionHeader>My Profile</SectionHeader>
            <p style={{textAlign: 'center', color: '#888', marginBottom: '15px'}}>Quick access to your account settings.</p>
            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '15px'}}>
                <Link to="/profile" style={{color: '#6c63ff', textDecoration: 'none', fontSize: '2.5rem'}}><FaUser /></Link>
                <Link to="/settings" style={{color: '#6c63ff', textDecoration: 'none', fontSize: '2.5rem'}}><FaCog /></Link>
                <Link to="/addresses" style={{color: '#6c63ff', textDecoration: 'none', fontSize: '2.5rem'}}><FaMapMarkerAlt /></Link>
                <Link to="/payment" style={{color: '#6c63ff', textDecoration: 'none', fontSize: '2.5rem'}}><FaCreditCard /></Link>
            </div>
            <p style={{textAlign: 'center', color: '#888', fontSize: '0.9rem', marginTop: '15px'}}>Manage your details with ease.</p>
          </Card>
        </BottomTwoColumnGrid>

        {/* Quick Browse Categories - Now fetched from backend */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          <SectionHeader>Quick Browse Categories</SectionHeader>
          {loadingCategories ? (
            <LoadingMessage>Loading categories...</LoadingMessage>
          ) : categoriesError ? (
            <ErrorMessage>{categoriesError}</ErrorMessage>
          ) : categories.length === 0 ? (
            <LoadingMessage>No categories found.</LoadingMessage>
          ) : (
            <CategoryBrowseWrapper>
              <CategoryBrowseInner>
                <AnimatePresence>
                  {categories.map((category, index) => {
                    return (
                      <CategoryCard 
                        key={category._id} 
                        variants={itemEnter} 
                        onClick={() => handleCategoryClick(category.name)}
                      >
                        <div className="icon">{categoryIconsMap[category.name] || <FaBoxes />}</div>
                        <div className="name">{category.name}</div>
                      </CategoryCard>
                    );
                  })}
                </AnimatePresence>
              </CategoryBrowseInner>
            </CategoryBrowseWrapper>
          )}
        </motion.div>

      </MainContentWrapper>

      <Footer />
    </DashboardContainer>
  );
};

export default DashboardPage;
