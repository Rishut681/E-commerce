import React, { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';

// Components
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';

// Icons
import { 
  FaBoxOpen, FaDollarSign, FaShoppingCart, FaStar, FaHeart, FaTruck, 
  FaChevronRight, FaChevronLeft, FaUser, FaCog, FaMapMarkerAlt, FaCreditCard,
  FaMobileAlt, FaLaptopCode, FaTv, FaHeadphonesAlt, FaGamepad, FaCameraRetro,
  FaGem, FaSuitcase, FaChair, FaBlender, FaBaby, FaRunning, FaCar, FaUtensils,
  FaUserTie, FaFemale, FaShoePrints, FaTshirt, FaBook, FaDesktop, FaSpinner, FaHome
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

export const ProductCardStyled = styled.div` /* Changed back to styled.div as it's not directly animated by Framer Motion now */
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

export const CategoryBrowseWrapper = styled.div`
  position: relative;
  overflow-x: auto; /* Enable horizontal scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  padding: 10px 0; /* Add some vertical padding */
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  &::-webkit-scrollbar { /* Hide scrollbar for Chrome, Safari, Opera */
    display: none;
  }
`;

export const CategoryBrowseInner = styled.div` /* Changed to styled.div */
  display: flex;
  gap: 20px; /* Gap between category cards */
  padding-bottom: 10px; /* Space for potential scrollbar area */
`;

export const CategoryCard = styled.div` /* Changed to styled.div */
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

// Exported styled components that were previously not exported
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
  gap: 25px; /* Gap between product cards */
`;

export const BottomTwoColumnGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); /* Adjust minmax as needed */
  gap: 30px; /* Gap between the two cards */

  @media (max-width: 1024px) {
    grid-template-columns: 1fr; /* Stack on smaller screens */
  }
`;

export const PromotionBanner = styled(Card)`
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

// Export these variants so they are accessible throughout the module
export const sectionEnter = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.1 } },
};

export const itemEnter = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
};

// Removed carouselVariants from here, it will be defined inside the component
// to use productCardWidth.

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userData, isLoadingAuth } = useAuth();
  const userName = userData?.name || 'Customer';

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productPageIndex, setProductPageIndex] = useState(0);
  const [productsPerView, setProductsPerView] = useState(4);
  const [direction, setDirection] = useState(0); 

  // Ref to measure the width of a single product card
  const productCardRef = useRef(null);
  const [productCardWidth, setProductCardWidth] = useState(0);
  const productGap = 25; // Define the gap size

  const [metrics] = useState([
    { id: 1, label: "Total Orders", value: "12", icon: <FaBoxOpen /> },
    { id: 2, label: "Pending Orders", value: "2", icon: <FaTruck /> },
    { id: 3, label: "Total Spent", value: "$1,250", icon: <FaDollarSign /> },
    { id: 4, label: "Wishlist Items", value: "7", icon: <FaHeart /> },
  ]);

  const [recentOrders] = useState([
    { id: 'ORD-001', date: '2025-06-25', status: 'delivered', amount: '$75.00' },
    { id: 'ORD-002', date: '2025-06-22', status: 'shipped', amount: '$120.50' },
    { id: 'ORD-003', date: '2025-06-18', status: 'pending', amount: '$45.99' },
  ]);

  // Effect to handle responsive productsPerView and measure card width
  useEffect(() => {
    const handleResize = () => {
      let newProductsPerView;
      if (window.innerWidth <= 480) newProductsPerView = 1;
      else if (window.innerWidth <= 768) newProductsPerView = 2;
      else if (window.innerWidth <= 1200) newProductsPerView = 3;
      else newProductsPerView = 4;
      setProductsPerView(newProductsPerView);

      // Measure product card width after layout has settled
      if (productCardRef.current) {
        setProductCardWidth(productCardRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to measure card width once products are loaded and ref is available
  useEffect(() => {
    if (productCardRef.current && allProducts.length > 0 && productCardWidth === 0) {
      setProductCardWidth(productCardRef.current.offsetWidth);
    }
  }, [allProducts, productCardWidth]);


  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch('https://e-commerce-44nm.onrender.com/api/categories'); 
        const data = await res.json();
        setCategories(data);
      } catch (e) {
        console.error("Error fetching categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    };
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch('https://e-commerce-44nm.onrender.com/api/products?limit=20&sort=newest'); 
        const data = await res.json();
        setAllProducts(data.products);
      } catch (e) {
        console.error("Error fetching products:", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCategories();
    fetchProducts();
  }, []);

  const handleCategoryClick = (name) => {
    navigate(`/shop?category=${encodeURIComponent(name)}`);
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const paginate = (dir) => {
    setDirection(dir); // Set direction for animation
    const totalItems = allProducts.length;
    // Calculate the maximum index the carousel can scroll to while keeping `productsPerView` items visible
    const maxIndex = Math.max(0, totalItems - productsPerView); 

    setProductPageIndex((prev) => {
      let newIndex = prev + dir;
      // Clamp the index to prevent going out of bounds
      newIndex = Math.max(0, Math.min(newIndex, maxIndex));
      return newIndex;
    });
  };

  // Calculate the X offset for the carousel based on current index, card width, and gap
  const carouselXOffset = -(productPageIndex * (productCardWidth + productGap));

  // Define carouselVariants inside the component to use productCardWidth
  const carouselVariants = {
    center: {
      x: carouselXOffset,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
      }
    }
  };


  return (
    <DashboardContainer>
      <DashboardNavbar />
      <MainContentWrapper>
        {/* Removed the outer motion.div with staggerChildren as it was causing issues.
            Individual sections will animate with sectionEnter. */}
          <WelcomeBanner
            initial="hidden"
            animate="visible"
            variants={sectionEnter} 
          >
            <h1>Welcome, {isLoadingAuth ? '...' : userName}!</h1>
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


          <SectionHeader>Recommended for You</SectionHeader>
          {loadingProducts ? <LoadingMessage>Loading products...</LoadingMessage> : (
            <CarouselWrapper>
              {/* ProductCarouselInner will now animate its 'x' property */}
              <ProductCarouselInner
                animate={carouselVariants.center} // Animate x directly using the defined variant
                style={{ 
                  '--products-per-view': productsPerView, 
                  '--gap-size': `${productGap}px`, // Pass gap as CSS variable
                  '--gap-count': productsPerView > 1 ? (productsPerView - 1) : 0 
                }}
              >
                {allProducts.map((product, index) => ( // Map all products, not just paginated
                  <ProductCardStyled 
                    key={product._id} 
                    ref={index === 0 ? productCardRef : null} // Attach ref to the first card to measure width
                    onClick={() => handleProductClick(product._id)}
                  >
                    <img src={product.image} alt={product.name} onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/cccccc/333333?text=No+Image"; }} />
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="price">${product.price.toFixed(2)}</p>
                      <div className="rating">{Array(5).fill().map((_, i) => <FaStar key={i} color={i < 4 ? '#f39c12' : '#ddd'} />)} (4.0)</div>
                      <button className="add-to-cart-btn">Add to Cart</button>
                    </div>
                  </ProductCardStyled>
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
                    disabled={productPageIndex >= allProducts.length - productsPerView} // Corrected disabled logic
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
            <Card> {/* Changed from MetricCard to Card to remove unnecessary metric styling */}
              <SectionHeader>My Profile</SectionHeader>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
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
                {/* Removed AnimatePresence and variants from individual CategoryCard */}
                {categories.map((c) => (
                  <CategoryCard key={c._id} onClick={() => handleCategoryClick(c.name)}>
                    <div className="icon">{categoryIconsMap[c.name] || <FaSpinner />}</div>
                    <div className="name">{c.name}</div>
                  </CategoryCard>
                ))}
              </CategoryBrowseInner>
            </CategoryBrowseWrapper>
          )}
        {/* Removed this closing motion.div tag */}
      </MainContentWrapper>
      <Footer />
    </DashboardContainer>
  );
};

export default DashboardPage;