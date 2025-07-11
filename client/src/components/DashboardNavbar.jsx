import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaShoppingCart, FaUserCircle, FaSearch, FaSignOutAlt, FaUser, FaBoxOpen,
  FaLaptop, FaTshirt, FaHome, FaBook, FaRunning, FaCar, FaUtensils, 
  FaChevronDown, FaChevronUp, FaRegBell, FaTools, FaHeart, FaMapMarkerAlt, FaCreditCard, FaSpinner // Added FaSpinner
} from 'react-icons/fa';
import SearchBar from "./common/SearchBar";

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

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background-color: #6c63ff;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }

  @media (max-width: 768px) {
    padding: 12px 0;
    font-size: 1.1rem;
    &::after {
      bottom: -3px;
    }
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

// Modified CartIcon to use a dot instead of count
const CartIcon = styled(Link)`
  position: relative;
  font-size: 1.8rem;
  color: #555;
  text-decoration: none;
  transition: color 0.3s ease;
  padding: 5px; /* Add padding for better touch target */

  &:hover {
    color: #6c63ff;
  }

  // Dot indicator for cart items
  &.has-items::after {
    content: '';
    position: absolute;
    top: -2px; /* Adjust position as needed */
    right: -2px; /* Adjust position as needed */
    width: 8px;
    height: 8px;
    background-color: #ff4d4d; /* Red dot */
    border-radius: 50%;
    border: 1px solid white; /* Small white border for visibility */
  }
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
  const { isLoggedIn, userData, logout, authToken, cartCount, fetchCartCount } = useAuth(); // Destructure cartCount and fetchCartCount
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); 
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false); 
  const isAdmin = isLoggedIn && userData && userData.role === 'admin'; 

  // State for fetched categories
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // Define how many categories to show directly in the dropdown
  const maxCategoriesToShow = 6; 

  // Map category names to relevant icons
  const categoryIconsMap = {
    'Electronics': <FaLaptop />,
    'Wearables': <FaRegBell />, // Using FaRegBell as a placeholder for wearables
    'Home & Kitchen': <FaHome />,
    'Apparel': <FaTshirt />,
    "Men's Clothing": <FaUser />, // Using FaUser as a placeholder
    "Women's Clothing": <FaUser />, // Using FaUser as a placeholder
    "Footwear": <FaShoppingCart />, // Using FaShoppingCart as a placeholder
    "Smartphones": <FaLaptop />, // Using FaLaptop as a placeholder
    "Laptops": <FaLaptop />,
    "Televisions": <FaHome />, // Using FaHome as a placeholder
    "Audio": <FaRegBell />, // Using FaRegBell as a placeholder
    "Books": <FaBook />,
    'Sports & Outdoors': <FaRunning />,
    'Automotive': <FaCar />,
    'Groceries': <FaUtensils />,
    'Health & Beauty': <FaHeart />, // Using FaHeart as a placeholder
    'Toys & Games': <FaBoxOpen />, // Using FaBoxOpen as a placeholder
    'Furniture': <FaHome />, // Using FaHome as a placeholder
    'Kitchen Appliances': <FaUtensils />, // Using FaUtensils as a placeholder
    'Gaming': <FaLaptop />, // Using FaLaptop as a placeholder
    'Cameras': <FaRegBell />, // Using FaRegBell as a placeholder
    'Jewelry': <FaHeart />, // Using FaHeart as a placeholder
    'Bags & Luggage': <FaBoxOpen />, // Using FaBoxOpen as a placeholder
    // Add more mappings as needed based on your actual category names
  };

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoriesError(null);
      try {
        const response = await fetch('https://e-commerce-44nm.onrender.com/api/categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to load categories.');
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch cart count on mount and when auth state changes
  


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

  const handleUserMenuToggle = () => {
    setIsUserDropdownOpen(prev => !prev);
    setIsCategoriesDropdownOpen(false); // Close categories dropdown if user dropdown opens
  };

  const handleCategoryDropdownClick = () => {
    setIsCategoriesDropdownOpen(prev => !prev);
    setIsUserDropdownOpen(false); // Close user dropdown if categories opens
  };

  const handleCategorySelect = (categoryName) => {
    handleNavigation(`/shop?category=${encodeURIComponent(categoryName)}`); // Navigate to shop with category filter
  };

  const handleSearchSubmit = (searchTerm) => {
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
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
          
          {/* Categories Dropdown */}
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
                  {loadingCategories ? (
                    <DropdownItem style={{ justifyContent: 'center' }}>
                      <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Loading...
                    </DropdownItem>
                  ) : categoriesError ? (
                    <DropdownItem style={{ color: '#dc3545', justifyContent: 'center' }}>
                      Error loading categories.
                    </DropdownItem>
                  ) : categories.length === 0 ? (
                    <DropdownItem style={{ justifyContent: 'center' }}>
                      No categories found.
                    </DropdownItem>
                  ) : (
                    <>
                      {/* Option to view all categories page */}
                      <CategoriesDropdownItem onClick={() => handleNavigation('/categories')}>
                          <FaBoxOpen /> All Categories
                      </CategoriesDropdownItem>
                      <div style={{ borderTop: '1px solid #eee', margin: '5px 0' }} /> {/* Divider */}

                      {categories.slice(0, maxCategoriesToShow).map(category => ( // Limit categories displayed
                        <CategoriesDropdownItem 
                          key={category._id} // Use category._id as key
                          onClick={() => handleCategorySelect(category.name)}
                        >
                          {categoryIconsMap[category.name] || <FaBoxOpen />} {/* Fallback icon */}
                          {category.name}
                        </CategoriesDropdownItem>
                      ))}
                      {categories.length > maxCategoriesToShow && ( // Show "More" if there are more categories
                        <DropdownItem onClick={() => handleNavigation('/categories')}>
                          <FaChevronRight /> More Categories...
                        </DropdownItem>
                      )}
                    </>
                  )}
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
            <SearchBar onSearchSubmit={handleSearchSubmit} /> {/* SearchBar component */}
          </IconWrapper>
          <IconWrapper>
            <FaRegBell /> {/* Notifications icon */}
          </IconWrapper>
          <CartIcon to="/cart" className={isLoggedIn && cartCount > 0 ? 'has-items' : ''}> {/* Added className for dot */}
            <FaShoppingCart />
            {/* Removed cartCount display */}
          </CartIcon>
          
          <UserDropdownContainer className="user-dropdown-container">
            <IconWrapper onClick={handleUserMenuToggle}>
              <FaUserCircle />
            </IconWrapper>
            <AnimatePresence>
              {isUserDropdownOpen && (
                <UserDropdownMenu 
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropIn}
                >
                  {isLoggedIn ? (
                    <>
                      <DropdownItem onClick={() => handleNavigation('/account')}> {/* General Account/Profile page */}
                        <FaUser /> My Account
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavigation('/orders')}>
                        <FaBoxOpen /> Orders
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavigation('/wishlist')}>
                        <FaHeart /> Wishlist
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavigation('/addresses')}>
                        <FaMapMarkerAlt /> Addresses
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavigation('/payment-methods')}>
                        <FaCreditCard /> Payment Methods
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
