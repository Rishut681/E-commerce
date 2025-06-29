import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';

// Import DashboardNavbar and Footer
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';

// Comprehensive Fa Icon Imports
import { 
  FaBoxOpen, FaDollarSign, FaShoppingCart, FaStar, FaTags, FaChartLine, 
  FaChevronRight, FaRegBell, FaUser, FaCog, FaBell, FaEnvelope, FaSearch, 
  FaHeart, FaHome, FaCreditCard, FaMapMarkerAlt, FaQuestionCircle, FaTruck 
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

const RecommendedProductsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
  gap: 25px;
  margin-top: 20px; 

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr; 
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
  transition: transform 0.2s ease;

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
  }
  h3 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 8px;
  }
  .price {
    font-size: 1.15rem;
    color: #6c63ff;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .rating {
    color: #f39c12; /* Star color */
    font-size: 0.9rem;
    margin-bottom: 15px;
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

const CategoryBrowseGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
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


// --- Framer Motion Variants ---
const sectionEnter = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
};

const itemEnter = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
};

// --- DashboardPage Component ---

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userData, isLoadingAuth } = useAuth();

  const userName = userData ? userData.name : 'Customer'; 

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

  const [recommendedProducts] = useState([
    {
      id: 1,
      name: "Nexa Wireless Earbuds Pro",
      price: "99.99",
      rating: 4.8,
      imageUrl: "https://placehold.co/300x200/6c63ff/ffffff?text=Earbuds",
    },
    {
      id: 2,
      name: "Smart Watch Elite",
      price: "199.99",
      rating: 4.5,
      imageUrl: "https://placehold.co/300x200/3a2cdb/ffffff?text=Smart+Watch",
    },
    {
      id: 3,
      name: "Ultra HD Monitor 27'",
      price: "349.00",
      rating: 4.7,
      imageUrl: "https://placehold.co/300x200/ff6b6b/ffffff?text=Monitor",
    },
    {
      id: 4,
      name: "Gaming Mouse X-Pro",
      price: "59.99",
      rating: 4.9,
      imageUrl: "https://placehold.co/300x200/4CAF50/ffffff?text=Gaming+Mouse",
    },
  ]);

  const [categories] = useState([
    { id: 1, name: "Electronics", icon: <FaShoppingCart /> },
    { id: 2, name: "Fashion", icon: <FaTags /> },
    { id: 3, name: "Home Goods", icon: <FaHome /> },
    { id: 4, name: "Books", icon: <FaBoxOpen /> },
  ]);

  return (
    <DashboardContainer>
      {/* DashboardNavbar and Footer will now contain internal wrappers to match max-width */}
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
          <h2>Your Activity at a Glance</h2>
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
          <h2>Recent Orders</h2>
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

        {/* Personalized Recommendations (doubles as "Popular/New Arrivals") */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          <h2>Recommended for You</h2>
          <RecommendedProductsGrid>
            {recommendedProducts.map((product) => (
              <ProductCardStyled key={product.id} variants={itemEnter}>
                <img src={product.imageUrl} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price}</p>
                  <div className="rating">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar key={i} color={i < Math.floor(product.rating) ? "#f39c12" : "#e0e0e0"} />
                    ))} ({product.rating})
                  </div>
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
              </ProductCardStyled>
            ))}
          </RecommendedProductsGrid>
        </motion.div>

        {/* NEW SECTION: Promotion Banner and User Profile next to each other */}
        <BottomTwoColumnGrid
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          {/* Promotion Banner */}
          <PromotionBanner>
            <h2>Exclusive Offer!</h2>
            <p>Don't miss out on our limited-time deals. Sign up for our newsletter to get the latest updates directly in your inbox.</p>
            <button onClick={() => navigate('/Newsletter')}>Get Started Now!</button>
          </PromotionBanner>
          
          {/* Optional: Placeholder for User Profile Summary / Quick Links */}
          <Card> {/* Removed framer motion props here to apply them to the parent grid */}
            <h2>My Profile</h2>
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

        {/* Quick Browse Categories - Moved here so it's not always at the very bottom */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionEnter}
        >
          <h2>Quick Browse</h2>
          <CategoryBrowseGrid>
            {categories.map((category) => (
              <CategoryCard key={category.id} variants={itemEnter} onClick={() => navigate(`/categories/${category.name.toLowerCase()}`)}>
                <div className="icon">{category.icon}</div>
                <div className="name">{category.name}</div>
              </CategoryCard>
            ))}
          </CategoryBrowseGrid>
        </motion.div>

      </MainContentWrapper>

      <Footer />
    </DashboardContainer>
  );
};

export default DashboardPage;