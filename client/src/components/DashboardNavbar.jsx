import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaShoppingCart, FaUserCircle, FaSearch, FaSignOutAlt, FaUser, FaBoxOpen,
  FaLaptop, FaTshirt, FaHome, FaBook, FaBoxOpen as FaBoxOpenAlt, FaRunning, FaCar, FaUtensils, // Specific category icons
  FaChevronDown, FaChevronUp, FaRegBell, FaTools// For dropdown arrow
} from 'react-icons/fa';

// Assuming useAuth is correctly imported from your store/auth
import { useAuth } from '../store/auth'; 

// --- Styled Components ---

const NavbarContainer = styled.nav`
  background-color: #fff;
  padding: 15px 0; 
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavContentWrapper = styled.div`
  max-width: 1400px; 
  margin: 0 auto;
  padding: 0 30px; 
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 15px; 
  }
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: #6c63ff;
  text-decoration: none;
  display: flex;
  align-items: center;

  svg {
    margin-right: 8px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 30px;

  @media (max-width: 768px) {
    display: none; 
  }
`;

const NavLinkStyled = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: color 0.3s ease;
  position: relative; /* For dropdown positioning */

  &:hover {
    color: #6c63ff;
  }
`;

// NEW: Styled component for the Categories link with dropdown indicator
const CategoriesNavLink = styled(NavLinkStyled).attrs({ as: 'div' })`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

// NEW: Styles for the Categories Dropdown Menu
const CategoriesDropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 15px); /* Position below the Categories link */
  left: 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  padding: 10px 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CategoriesDropdownItem = styled.div`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: #f0f2f5;
    color: #6c63ff;
  }

  svg {
    font-size: 1.1rem;
    color: #6c63ff; /* Category icon color */
  }
`;


const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`;

const IconWrapper = styled.div`
  font-size: 1.5rem;
  color: #555;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;

  &:hover {
    color: #6c63ff;
  }
`;

const CartCount = styled.span`
  background-color: #ff6b6b;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  padding: 3px 7px;
  position: absolute;
  top: -8px;
  right: -8px;
`;

const UserDropdownContainer = styled.div`
  position: relative;
`;

const UserDropdownMenu = styled(motion.div)` /* Renamed for clarity */
  position: absolute;
  top: calc(100% + 15px); 
  right: 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  padding: 10px 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: #f0f2f5;
    color: #6c63ff;
  }

  svg {
    font-size: 1.1rem;
  }
`;

const dropIn = {
  hidden: {
    y: "-20px",
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: "0",
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      type: "spring",
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    y: "10px",
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // Renamed for clarity
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false); // NEW state for categories dropdown
  const [cartItemCount] = useState(3); 
  const isAdmin = isLoggedIn && userData && userData.role === 'admin'; 
  // Dummy Categories Data with Icons (Ideally, fetch this from backend /api/categories)
  const categories = [
    { id: 'electronics', name: 'Electronics', icon: <FaLaptop /> },
    { id: 'apparel', name: 'Apparel', icon: <FaTshirt /> },
    { id: 'home_kitchen', name: 'Home & Kitchen', icon: <FaHome /> },
    { id: 'books', name: 'Books', icon: <FaBook /> },
    { id: 'sports_outdoors', name: 'Sports & Outdoors', icon: <FaRunning /> },
    { id: 'automotive', name: 'Automotive', icon: <FaCar /> },
    { id: 'groceries', name: 'Groceries', icon: <FaUtensils /> },
    { id: 'health_beauty', name: 'Health & Beauty', icon: <FaBoxOpenAlt /> }, // Using FaBoxOpenAlt to avoid conflict
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user dropdown
      if (isUserDropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
      // Close categories dropdown
      if (isCategoriesDropdownOpen && !event.target.closest('.categories-dropdown-container')) {
        setIsCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen, isCategoriesDropdownOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsUserDropdownOpen(false); 
    setIsCategoriesDropdownOpen(false); // Close all dropdowns on navigation
  };

  const handleLogout = () => {
    logout(); 
    setIsUserDropdownOpen(false); 
  };

  const handleCategoryDropdownClick = () => {
    setIsCategoriesDropdownOpen(prev => !prev);
    setIsUserDropdownOpen(false); // Close user dropdown if categories opens
  };

  const handleCategorySelect = (categoryName) => {
    handleNavigation(`/shop?category=${categoryName}`); // Navigate to shop with category filter
  };

  return (
    <NavbarContainer>
      <NavContentWrapper>
        <Logo to="/home">
          <FaShoppingCart /> Nexa
        </Logo>

        <NavLinks>
          <NavLinkStyled to="/home">Home</NavLinkStyled>
          <NavLinkStyled to="/shop">Shop</NavLinkStyled>
          
          {/* NEW: Categories Dropdown */}
          <CategoriesNavLink 
            onClick={handleCategoryDropdownClick} 
            className="categories-dropdown-container"
          >
            Categories {isCategoriesDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            <AnimatePresence>
              {isCategoriesDropdownOpen && (
                <CategoriesDropdownMenu
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropIn}
                >
                  {/* Option to view all categories page */}
                  <CategoriesDropdownItem onClick={() => handleNavigation('/categories')}>
                      <FaBoxOpenAlt /> All Categories
                  </CategoriesDropdownItem>
                  <div style={{ borderTop: '1px solid #eee', margin: '5px 0' }} /> {/* Divider */}

                  {categories.map(category => (
                    <CategoriesDropdownItem 
                      key={category.id} 
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      {category.icon} {category.name}
                    </CategoriesDropdownItem>
                  ))}
                </CategoriesDropdownMenu>
              )}
            </AnimatePresence>
          </CategoriesNavLink>

          <NavLinkStyled to="/contact">Contact</NavLinkStyled>
          {isAdmin && (
            <NavLinkStyled to="/admin/products">
              <FaTools style={{ marginRight: '5px' }}/> Admin Panel
            </NavLinkStyled>
          )}
        </NavLinks>

        <UserActions>
          <IconWrapper>
            <FaSearch />
          </IconWrapper>
          <IconWrapper>
            <FaRegBell />
          </IconWrapper>
          <IconWrapper>
            <FaShoppingCart />
            {cartItemCount > 0 && <CartCount>{cartItemCount}</CartCount>}
          </IconWrapper>
          <UserDropdownContainer className="user-dropdown-container">
            <IconWrapper onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
              <FaUserCircle />
            </IconWrapper>
            <AnimatePresence>
              {isUserDropdownOpen && (
                <UserDropdownMenu // Renamed for clarity
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropIn}
                >
                  {isLoggedIn ? (
                    <>
                      <DropdownItem onClick={() => handleNavigation('/profile')}>
                        <FaUser /> Profile
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavigation('/orders')}>
                        <FaBoxOpen /> Orders
                      </DropdownItem>
                      <DropdownItem onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                      </DropdownItem>
                    </>
                  ) : (
                    <>
                      <DropdownItem onClick={() => handleNavigation('/login')}>
                        <FaSignOutAlt /> Login
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavigation('/signup')}>
                        <FaUserCircle /> Signup
                      </DropdownItem>
                    </>
                  )}
                </UserDropdownMenu>
              )}
            </AnimatePresence>
          </UserDropdownContainer>
        </UserActions>
      </NavContentWrapper>
    </NavbarContainer>
  );
};

export default DashboardNavbar;