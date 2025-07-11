import React, { useState, useEffect, useCallback, useRef } from 'react';
 import styled from 'styled-components'; 
 import { motion, AnimatePresence } from 'framer-motion'; 
 import { useNavigate, Link } from 'react-router-dom'; 
 import { useAuth } from '../store/auth'; 

 // Components 
 import DashboardNavbar from '../components/DashboardNavbar'; 
 import Footer from '../components/Footer'; 
 import ProductCard from '../components/products/ProductCard';
 import LoadingScreen from '../components/LoadingScreen'; // Import LoadingScreen

 // Icons 
 import {  
  FaBoxOpen, FaDollarSign, FaShoppingCart, FaStar, FaTruck,  
  FaChevronRight, FaChevronLeft, FaUser, FaCog, FaMapMarkerAlt, FaCreditCard, 
  FaMobileAlt, FaLaptopCode, FaTv, FaHeadphonesAlt, FaGamepad, FaCameraRetro, 
  FaGem, FaSuitcase, FaChair, FaBlender, FaBaby, FaRunning, FaCar, FaUtensils, 
  FaUserTie, FaFemale, FaShoePrints, FaTshirt, FaBook, FaDesktop, FaSpinner, FaHome, FaBoxes 
 } from 'react-icons/fa';


 export const DashboardContainer = styled.div` 
  min-height: 100vh; 
  background-color: #f0f2f5; 
  font-family: 'Arial', sans-serif; 
  display: flex; 
  flex-direction: column; 
 `; 

 export const MainContentWrapper = styled.div` 
  width: 100%; 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 30px; 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 30px; 
  flex-grow: 1; 

  @media (max-width: 768px) { 
    padding: 15px; 
  } 
 `; 

 export const SectionHeader = styled.h2` 
  font-size: 1.8rem; 
  color: #333; 
  margin-bottom: 20px; 
  font-weight: 700; 

  @media (max-width: 768px) { 
    font-size: 1.5rem; 
    margin-bottom: 15px; 
  } 
 `; 

 export const Card = styled.div` 
  background-color: #ffffff; 
  border-radius: 12px; 
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08); 
  padding: 30px; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  min-height: 150px; 

  h2 { 
    font-size: 1.5rem; 
    color: #333; 
    margin-bottom: 20px; 
    font-weight: 700; 
  } 
 `; 

 export const MetricsGrid = styled.div` 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
  gap: 20px; 

  @media (max-width: 480px) { 
    grid-template-columns: 1fr; 
  } 
 `; 

 export const MetricCard = styled(Card)` 
  padding: 20px; 
  align-items: flex-start; 

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

 export const LoadingMessage = styled.p` 
  text-align: center; 
  font-size: 1.2rem; 
  color: #666; 
  padding: 50px; 
 `; 

 export const ErrorMessage = styled.p` 
  text-align: center; 
  font-size: 1.2rem; 
  color: #dc3545; 
  padding: 50px; 
 `; 

 export const CarouselWrapper = styled.div` 
  position: relative; 
  overflow: hidden; 
  padding: 10px 0; 
 `; 

 export const CarouselButton = styled.button` 
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
    left: -20px; 
  } 

  &.right { 
    right: -20px; 
  } 
 `; 

 export const ProductCardStyled = styled.div` 
  background-color: #fff; 
  border-radius: 12px; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); 
  overflow: hidden; 
  text-align: left; 
  display: flex; 
  flex-direction: column; 
  cursor: pointer; 
  min-height: 350px; 
  flex-shrink: 0; 

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

 export const CategoryBrowseWrapper = styled.div` 
  position: relative; 
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 10px 0;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none; 
  } 
 `; 

 export const CategoryBrowseInner = styled.div`
  display: flex; 
  gap: 20px;
  padding-bottom: 10px;
 `; 

 export const CategoryCard = styled.div`
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
  flex-shrink: 0; 
  width: 180px; 
  height: 150px; 

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

 export const WelcomeBanner = styled(Card)` 
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

 export const WelcomeIllustration = styled.div` 
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

 export const ProductCarouselInner = styled(motion.div)` 
  display: flex; 
  gap: 25px;
  flex-wrap: nowrap;
  min-height: 380px;
 `; 

 export const BottomTwoColumnGrid = styled(motion.div)` 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 30px; 

  @media (max-width: 1024px) { 
    grid-template-columns: 1fr;
  } 
 `; 

 export const PromotionBanner = styled(Card)` 
  background: linear-gradient(90deg, #ff6b6b 0%, #ff8c42 100%); 
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

 export const Message = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  padding: 20px;
`;


 const categoryIconsMap = { 
  'Electronics': <FaDesktop />, 'Wearables': <FaSpinner />, 'Home & Kitchen': <FaHome />, 
  'Apparel': <FaTshirt />, "Men's Clothing": <FaUserTie />, "Women's Clothing": <FaFemale />, 
  'Footwear': <FaShoePrints />, 'Smartphones': <FaMobileAlt />, 'Laptops': <FaLaptopCode />, 
  'Televisions': <FaTv />, 'Audio': <FaHeadphonesAlt />, 'Books': <FaBook />, 
  'Sports & Outdoors': <FaRunning />, 'Automotive': <FaCar />, 'Groceries': <FaUtensils />, 
  'Health & Beauty': <FaGem />, 'Toys & Games': <FaBaby />, 'Furniture': <FaChair />, 
  'Kitchen Appliances': <FaBlender />, 'Gaming': <FaGamepad />, 'Cameras': <FaCameraRetro />, 
  'Jewelry': <FaGem />, 'Bags & Luggage': <FaSuitcase /> 
 }; 

 export const sectionEnter = { 
  hidden: { opacity: 0, y: 50 }, 
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.1 } }, 
 }; 

 export const itemEnter = { 
  hidden: { opacity: 0, scale: 0.9 }, 
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }, 
 }; 

 const DashboardPage = () => { 
  const navigate = useNavigate(); 
  const { userData, isLoadingAuth, fetchCartCount, isLoggedIn, authToken } = useAuth(); 
  
  // No need for these debug logs anymore, as the AuthContext logs confirm data is received
  // console.log('DashboardPage: isLoadingAuth:', isLoadingAuth);
  // console.log('DashboardPage: userData:', userData);
  // console.log('DashboardPage: isLoggedIn:', isLoggedIn);

  // Display a loading screen if authentication state is still loading
  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  // If not logged in after loading, redirect to login or show a message
  if (!isLoggedIn) {
      // You might want a more user-friendly message or redirect here
      return (
          <DashboardContainer>
              <DashboardNavbar />
              <MainContentWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Message>Please log in to view your dashboard.</Message>
                  <button onClick={() => navigate('/login')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#6c63ff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      Login
                  </button>
              </MainContentWrapper>
              <Footer />
          </DashboardContainer>
      );
  }

  // Now that we know isLoggedIn is true and isLoadingAuth is false, userData should be available
  const userName = userData.userData?.name; 

  const [categories, setCategories] = useState([]); 
  const [allProducts, setAllProducts] = useState([]); 
  const [loadingCategories, setLoadingCategories] = useState(true); 
  const [loadingProducts, setLoadingProducts] = useState(true); 
  const [productPageIndex, setProductPageIndex] = useState(0); 
  const [productsPerView, setProductsPerView] = useState(4); 
  const [direction, setDirection] = useState(0);   

  const productCardRef = useRef(null); 
  const [productCardWidth, setProductCardWidth] = useState(0); 
  const productGap = 25; 

  const [metrics] = useState([
    { id: 1, label: "Total Orders", value: "12", icon: <FaBoxOpen /> },
    { id: 2, label: "Pending Orders", value: "2", icon: <FaTruck /> },
    { id: 3, label: "Total Spent", value: "$1,250", icon: <FaDollarSign /> },
    { id: 4, label: "Cart Items", value: "7", icon: <FaShoppingCart /> },
  ]);

  const [recentOrders] = useState([
    { id: 'ORD-001', date: '2025-06-25', status: 'delivered', amount: '$75.00' },
    { id: 'ORD-002', date: '2025-06-22', status: 'shipped', amount: '$120.50' },
    { id: 'ORD-003', date: '2025-06-18', status: 'pending', amount: '$45.99' },
  ]);

  useEffect(() => { 
    const handleResize = () => { 
      let newProductsPerView; 
      if (window.innerWidth <= 480) newProductsPerView = 1; 
      else if (window.innerWidth <= 768) newProductsPerView = 2; 
      else if (window.innerWidth <= 1200) newProductsPerView = 3; 
      else newProductsPerView = 4; 
      setProductsPerView(newProductsPerView); 

      if (productCardRef.current) { 
        setProductCardWidth(productCardRef.current.offsetWidth); 
      } 
    }; 

    window.addEventListener('resize', handleResize); 
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize); 
  }, []); 

  useEffect(() => { 
    if (productCardRef.current && allProducts.length > 0 && productCardWidth === 0) { 
      setProductCardWidth(productCardRef.current.offsetWidth); 
    } 
  }, [allProducts, productCardWidth]); 


  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('https://e-commerce-44nm.onrender.com/api/categories'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories for dashboard:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchAllProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('https://e-commerce-44nm.onrender.com/api/products?limit=20&sort=newest');
      const data = await res.json();
      
      let productsToDisplay = data.products || [];

      if (productsToDisplay.length > 12) {
        for (let i = productsToDisplay.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [productsToDisplay[i], productsToDisplay[j]] = [productsToDisplay[j], productsToDisplay[i]];
        }
        productsToDisplay = productsToDisplay.slice(0, 12);
      }
      setAllProducts(productsToDisplay);
    } catch (e) {
      console.error("Error fetching products:", e);
      setAllProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => { 
    fetchCategories(); 
    fetchAllProducts(); 
  }, [fetchCategories, fetchAllProducts]); 

  const carouselXOffset = -(productPageIndex * (productCardWidth + productGap)); 

  const carouselVariants = { 
    center: { 
      x: carouselXOffset, 
      transition: { 
        x: { type: "spring", stiffness: 300, damping: 30 }, 
      } 
    } 
  }; 


  const paginate = (dir) => { 
    setDirection(dir);
    const totalItems = allProducts.length; 
    const maxIndex = Math.max(0, totalItems - productsPerView);  

    setProductPageIndex((prev) => { 
      let newIndex = prev + dir; 
      newIndex = Math.max(0, Math.min(newIndex, maxIndex)); 
      return newIndex; 
    }); 
  }; 


  const handleCategoryClick = (name) => { 
    navigate(`/shop?category=${encodeURIComponent(name)}`); 
  }; 

  return ( 
    <DashboardContainer> 
      <DashboardNavbar /> 
      <MainContentWrapper> 
          <WelcomeBanner 
            initial="hidden" 
            animate="visible" 
            variants={sectionEnter}  
          > 
            <h1>Welcome, {userName}!</h1> 
            <p>Explore your dashboard and discover new deals curated for you.</p> 
            <WelcomeIllustration><FaShoppingCart /></WelcomeIllustration>  
          </WelcomeBanner> 

          <SectionHeader>Your Activity</SectionHeader> 
          <MetricsGrid> 
            {metrics.map((m) => ( 
              <MetricCard key={m.id} 
                variants={itemEnter}   
                initial="hidden" 
                animate="visible" 
              > 
                <div className="icon">{m.icon}</div> 
                <div className="value">{m.value}</div> 
                <div className="label">{m.label}</div> 
              </MetricCard> 
            ))} 
          </MetricsGrid> 

          <SectionHeader>Recent Orders</SectionHeader>
          <Card>
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id}> 
                  <div>
                    <span className="order-id">{order.id}</span>
                    <br />
                    <span className="order-date">{new Date(order.date).toLocaleDateString()}</span> 
                  </div>
                  <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span> 
                  <strong>${order.amount}</strong> 
                </li>
              ))}
            </ul>
            <div className="view-all-link">
              <a href="/orders">View All Orders <FaChevronRight style={{ verticalAlign: 'middle', fontSize: '0.9em' }}/></a>
            </div>
          </Card>


          <SectionHeader>Recommended for You</SectionHeader> 
          {loadingProducts ? <LoadingMessage>Loading products...</LoadingMessage> : ( 
            <CarouselWrapper> 
              <ProductCarouselInner 
                animate={carouselVariants.center} 
                style={{   
                  '--products-per-view': productsPerView,   
                  '--gap-size': `${productGap}px`, 
                  '--gap-count': productsPerView > 1 ? (productsPerView - 1) : 0   
                }} 
              > 
                {allProducts.map((product, index) => ( 
                  <ProductCard
                    key={product._id}   
                    product={product}
                    ref={index === 0 ? productCardRef : null}
                    onCartUpdate={fetchCartCount}
                    variants={itemEnter}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  />
                ))} 
              </ProductCarouselInner> 
              {allProducts.length > productsPerView && ( 
                <> 
                  <CarouselButton   
                    className="left"   
                    onClick={() => paginate(-1)}   
                    disabled={productPageIndex === 0} 
                  > 
                    <FaChevronLeft /> 
                  </CarouselButton> 
                  <CarouselButton   
                    className="right"   
                    onClick={() => paginate(1)}   
                    disabled={productPageIndex >= allProducts.length - productsPerView} 
                  > 
                    <FaChevronRight /> 
                  </CarouselButton> 
                </> 
              )} 
            </CarouselWrapper> 
          )} 

          <BottomTwoColumnGrid 
            initial="hidden" 
            animate="visible" 
            variants={sectionEnter}  
          > 
            <PromotionBanner> 
              <SectionHeader>Exclusive Offer!</SectionHeader> 
              <p>Don't miss out on limited-time deals. Sign up for updates.</p> 
              <button onClick={() => navigate('/newsletter')}>Subscribe</button> 
            </PromotionBanner> 
            <Card> 
              <SectionHeader>My Profile</SectionHeader> 
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}> 
                <Link to="/profile" style={{color: '#6c63ff', textDecoration: 'none', fontSize: '2.5rem'}}><FaUser /></Link> 
                <Link to="/settings" style={{color: '#6c63ff', textDecoration: 'none', fontSize: '2.5rem'}}><FaCog /></Link> 
                <Link to="/addresses" style={{color: '#6c63ff', textDecoration: 'none', fontSize: '2.5rem'}}><FaMapMarkerAlt /></Link> 
                <Link to="/payment" style={{color: '#6c63ff', textDecoration: 'none', fontSize: '2.5rem'}}><FaCreditCard /></Link> 
              </div> 
            </Card> 
          </BottomTwoColumnGrid> 

          <SectionHeader>Browse Categories</SectionHeader> 
          {loadingCategories ? <LoadingMessage>Loading categories...</LoadingMessage> : ( 
            <CategoryBrowseWrapper> 
              <CategoryBrowseInner> 
                <AnimatePresence>
                  {categories.map((c) => ( 
                    <CategoryCard key={c._id} onClick={() => handleCategoryClick(c.name)}> 
                      <div className="icon">{categoryIconsMap[c.name] || <FaBoxes />}</div> 
                      <div className="name">{c.name}</div> 
                    </CategoryCard> 
                  ))} 
                </AnimatePresence>
              </CategoryBrowseInner> 
            </CategoryBrowseWrapper> 
          )} 
      </MainContentWrapper> 
      <Footer /> 
    </DashboardContainer> 
  ); 
 }; 

 export default DashboardPage;
