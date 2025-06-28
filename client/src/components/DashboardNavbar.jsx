import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import {
  FaSearch, FaShoppingCart, FaHeart, FaUserCircle, FaBars, FaTimes, FaSignOutAlt, FaCog, FaHistory, FaHome, FaAddressBook
} from 'react-icons/fa'; // Importing necessary icons
// import config from '../config'; // COMMENTED OUT: Not needed without backend interaction for now

// --- Styled Components for Navbar (No Changes) ---

const NavWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background-color: #1a1a2e;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  position: sticky; /* Make it sticky at the top */
  top: 0;
  width: 100%;
  z-index: 1000;

  @media (max-width: 1024px) {
    padding: 15px 25px;
  }
  @media (max-width: 768px) {
    padding: 10px 15px;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 30px; /* Space between logo and nav links */
  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const Logo = styled(motion.div)`
  font-size: 1.8rem;
  font-weight: bold;
  color: #6c63ff;
  cursor: pointer;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.05); /* Subtle text shadow */

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 25px;

  @media (max-width: 768px) {
    display: none; /* Hide on small screens, will be in hamburger menu */
  }
`;

const NavLinkItem = styled(motion.li)`
  a {
    color:rgb(255, 255, 255);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;

    &:hover {
      color: #6c63ff;
    }

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      background-color: #6c63ff;
      left: 50%;
      bottom: -5px;
      transition: width 0.3s ease, left 0.3s ease;
    }
    &:hover::after {
      width: 100%;
      left: 0;
    }
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 8px 15px;
  transition: all 0.3s ease;
  width: 250px; /* Default width */

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.03);
    background-color: #fff;
  }

  @media (max-width: 1024px) {
    width: 200px;
  }
  @media (max-width: 768px) {
    width: 40px; /* Collapse to just icon */
    background-color: transparent;
    padding: 0;
    &:focus-within {
      width: 150px; /* Expand on focus */
      background-color: #f5f5f5;
      padding: 8px 15px;
    }
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  font-size: 1rem;
  color: #333;
  flex-grow: 1;
  padding-left: 10px; /* Space for icon */

  @media (max-width: 768px) {
    display: none; /* Hidden by default on mobile */
    ${SearchContainer}:focus-within & {
      display: block; /* Show when container is focused */
    }
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #ffffff;
  font-size: 1.1rem;
  cursor: pointer;
`;

const ActionIcon = styled(motion.div)`
  color: #ffffff;
  font-size: 1.4rem;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;

  &:hover {
    color: #6c63ff;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 50%;
  padding: 3px 6px;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
`;

const UserDropdownContainer = styled.div`
  position: relative;
`;

const UserAvatar = styled(ActionIcon)`
  font-size: 2rem; /* Larger for avatar */
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 150%; /* Position below avatar */
  right: 0;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  padding: 10px 0;
  z-index: 1001; /* Ensure it's above other elements */
  overflow: hidden; /* For animation */
`;

const DropdownItem = styled(motion.div)`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color:rgb(0, 0, 0);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: #f0f2f5;
    color: #6c63ff;
  }
`;

const HamburgerMenu = styled.div`
  display: none;
  font-size: 1.8rem;
  color:rgb(255, 255, 255);
  cursor: pointer;
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileSidebar = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.15);
  z-index: 1002;
  display: flex;
  flex-direction: column;
  padding: 20px;
  transform: translateX(-100%); /* Start off-screen */

  @media (min-width: 769px) {
    display: none; /* Hidden on larger screens */
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const CloseButton = styled(FaTimes)`
  font-size: 1.8rem;
  color: #555;
  cursor: pointer;
`;

const MobileNavLinks = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MobileNavLinkItem = styled(DropdownItem)`
  padding: 10px 0;
`;

// --- DashboardNavbar Component ---

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItemCount, setCartItemCount] = useState(3); // Dummy count
  const [wishlistItemCount, setWishlistItemCount] = useState(1); // Dummy count
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const dropdownRef = useRef(null); // Ref for clicking outside dropdown

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      alert(`Searching for: ${searchTerm}`); // Use alert for now
      // In a real app, navigate to a search results page:
      // navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Clear search input
    }
  };

  const handleLogout = () => {
    alert('Logged out!');
    // When connecting backend later, uncomment these lines:
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('userID');
    navigate('/login'); // Still navigate to login for frontend flow
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowMobileSidebar(false); // Close sidebar on navigation
  };

  const userDropdownVariants = {
    hidden: { opacity: 0, y: -10, scaleY: 0.8, originY: "top" },
    visible: { opacity: 1, y: 0, scaleY: 1, originY: "top", transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, scaleY: 0.8, originY: "top", transition: { duration: 0.15 } },
  };

  const mobileSidebarVariants = {
    hidden: { x: '-100%' },
    visible: { x: '0%', transition: { type: "tween", duration: 0.3 } },
    exit: { x: '-100%', transition: { type: "tween", duration: 0.3 } },
  };

  return (
    <NavWrapper>
      <NavLeft>
        <Logo
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleNavigation('/home')}
        >
          Nexa
        </Logo>

        <NavLinks>
          <NavLinkItem whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a onClick={() => handleNavigation('/home')}>Home</a>
          </NavLinkItem>
          <NavLinkItem whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a onClick={() => handleNavigation('/shop')}>Shop</a>
          </NavLinkItem>
          <NavLinkItem whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a onClick={() => handleNavigation('/categories')}>Categories</a>
          </NavLinkItem>
        </NavLinks>
      </NavLeft>

      <NavRight>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
          />
          <SearchIcon onClick={handleSearch} />
        </SearchContainer>

        {isLoggedIn && ( // Only show cart/wishlist if logged in
          <>
            <ActionIcon whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FaHeart onClick={() => handleNavigation('/wishlist')} />
              {wishlistItemCount > 0 && <Badge>{wishlistItemCount}</Badge>}
            </ActionIcon>

            <ActionIcon whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FaShoppingCart onClick={() => handleNavigation('/cart')} />
              {cartItemCount > 0 && <Badge>{cartItemCount}</Badge>}
            </ActionIcon>
          </>
        )}

        <UserDropdownContainer ref={dropdownRef}>
          <UserAvatar
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <FaUserCircle />
          </UserAvatar>
          <AnimatePresence>
            {showUserDropdown && (
              <DropdownMenu
                variants={userDropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {isLoggedIn ? ( // Conditional rendering based on login status
                  <>
                    <DropdownItem onClick={() => handleNavigation('/profile')}>
                      <FaUserCircle /> My Profile
                    </DropdownItem>
                    <DropdownItem onClick={() => handleNavigation('/orders')}>
                      <FaHistory /> My Orders
                    </DropdownItem>
                    <DropdownItem onClick={() => handleNavigation('/contact')}>
                      <FaAddressBook /> Contact Us
                    </DropdownItem>
                    <DropdownItem onClick={() => handleNavigation('/settings')}>
                      <FaCog /> Settings
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
              </DropdownMenu>
            )}
          </AnimatePresence>
        </UserDropdownContainer>

        <HamburgerMenu onClick={() => setShowMobileSidebar(true)}>
          <FaBars />
        </HamburgerMenu>
      </NavRight>

      <AnimatePresence>
        {showMobileSidebar && (
          <MobileSidebar
            variants={mobileSidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <SidebarHeader>
              <Logo onClick={() => handleNavigation('/home')}>Nexa</Logo>
              <CloseButton onClick={() => setShowMobileSidebar(false)} />
            </SidebarHeader>
            <MobileNavLinks>
              <MobileNavLinkItem onClick={() => handleNavigation('/home')}>
                <FaHome /> Home
              </MobileNavLinkItem>
              <MobileNavLinkItem onClick={() => handleNavigation('/shop')}>
                <FaShoppingCart /> Shop
              </MobileNavLinkItem>
              <MobileNavLinkItem onClick={() => handleNavigation('/categories')}>
                <FaBars /> Categories
              </MobileNavLinkItem>
              {isLoggedIn ? ( // Conditional rendering for mobile sidebar
                <>
                  <MobileNavLinkItem onClick={() => handleNavigation('/profile')}>
                    <FaUserCircle /> My Profile
                  </MobileNavLinkItem>
                  <MobileNavLinkItem onClick={() => handleNavigation('/orders')}>
                    <FaHistory /> My Orders
                  </MobileNavLinkItem>
                  <MobileNavLinkItem onClick={() => handleNavigation('/settings')}>
                    <FaCog /> Settings
                  </MobileNavLinkItem>
                  <MobileNavLinkItem onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </MobileNavLinkItem>
                </>
              ) : (
                <>
                  <MobileNavLinkItem onClick={() => handleNavigation('/login')}>
                    <FaSignOutAlt /> Login
                  </MobileNavLinkItem>
                  <MobileNavLinkItem onClick={() => handleNavigation('/signup')}>
                    <FaUserCircle /> Signup
                  </MobileNavLinkItem>
                </>
              )}
              <MobileNavLinkItem onClick={() => handleNavigation('/contact')}>
                <FaAddressBook /> Contact Us
              </MobileNavLinkItem>
            </MobileNavLinks>
          </MobileSidebar>
        )}
      </AnimatePresence>
    </NavWrapper>
  );
};
export default DashboardNavbar;