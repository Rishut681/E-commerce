import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Added FaTimes for close button

// --- Styled Components ---

const SearchModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent dark background */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top */
  z-index: 10000; /* High z-index to be on top of everything */
  padding-top: 100px; /* Space from the top */
  backdrop-filter: blur(5px); /* Subtle blur effect */

  @media (max-width: 768px) {
    padding-top: 50px;
    align-items: center; /* Center vertically on smaller screens if preferred */
  }
`;

const SearchBarContainer = styled(motion.form)`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  width: 90%; /* Responsive width */
  max-width: 700px; /* Max width for desktop */

  input {
    flex-grow: 1;
    border: none;
    outline: none;
    padding: 10px 0;
    font-size: 1.2rem; /* Larger font for better visibility */
    color: #333;
    &::placeholder {
      color: #999;
    }
  }

  button {
    background: none;
    border: none;
    color: #6c63ff;
    cursor: pointer;
    font-size: 1.5rem; /* Larger icon buttons */
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;

    &:hover {
      color: #5a54d4;
    }
  }

  .close-button {
    color: #666;
    &:hover {
      color: #dc3545; /* Red for close */
    }
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    gap: 10px;
    input {
      font-size: 1rem;
    }
    button {
      font-size: 1.2rem;
    }
  }
`;

// Framer Motion variants for the modal and search bar
const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const searchBarVariants = {
  hidden: { y: -50, opacity: 0, scale: 0.9 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
  exit: { y: -30, opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};


// --- SearchBar Component ---
const SearchBar = ({ onSearchSubmit }) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchBarRef = useRef(null); // Ref for detecting clicks outside

  // Handle click outside to close the search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSearchModal(false);
      }
    };

    if (showSearchModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchModal]);

  const handleOpenSearch = () => {
    setShowSearchModal(true);
    setSearchTerm(''); // Clear previous search term when opening
  };

  const handleCloseSearch = () => {
    setShowSearchModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    }
    setShowSearchModal(false); // Close search bar after submission
  };

  return (
    <>
      {/* Icon in the navbar that triggers the search modal */}
      <FaSearch style={{ fontSize: '1.5rem', color: '#555', cursor: 'pointer', transition: 'color 0.3s ease' }} onClick={handleOpenSearch} />

      <AnimatePresence>
        {showSearchModal && (
          <SearchModalOverlay
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <SearchBarContainer
              ref={searchBarRef}
              variants={searchBarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus // Focus input when it appears
              />
              <button type="submit" aria-label="Search">
                <FaSearch />
              </button>
              <button type="button" onClick={handleCloseSearch} className="close-button" aria-label="Close Search">
                <FaTimes />
              </button>
            </SearchBarContainer>
          </SearchModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchBar;
