import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa'; // Added FaSpinner for loading
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

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
  flex-direction: column; /* Changed to column to stack input and results */
  gap: 15px;
  width: 90%; /* Responsive width */
  max-width: 700px; /* Max width for desktop */
  position: relative; /* For absolute positioning of results */

  @media (max-width: 768px) {
    padding: 10px 15px;
    gap: 10px;
  }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 15px;

  input {
    flex-grow: 1;
    border-radius: 12px;
    background-color:rgba(0, 0, 0, 0.81); 
    outline: none;
    padding: 10px 0;
    padding-left: 12px;
    font-size: 1.2rem; /* Larger font for better visibility */
    color: rgb(255, 255, 255);
    &::placeholder {
      color: rgba(255, 255, 255, 0.61);
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
    input {
      font-size: 1rem;
    }
    button {
      font-size: 1.2rem;
    }
  }
`;

const SearchResultsContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-height: 400px; /* Limit height for scrollability */
  overflow-y: auto; /* Enable scrolling for many results */
  width: 100%;
  padding: 10px 0;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  gap: 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f0f2f5;
  }

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
  }

  .info {
    flex-grow: 1;
  }

  .name {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
  }

  .price {
    color: #6c63ff;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .category-name {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
  }
`;

const NoResultsMessage = styled.p`
  text-align: center;
  color: #777;
  padding: 20px;
  font-style: italic;
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  margin: 20px auto;
  display: block;
  font-size: 2rem;
  color: #6c63ff;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SearchError = styled.p`
  text-align: center;
  color: #dc3545;
  padding: 20px;
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
const SearchBar = () => { // Removed onSearchSubmit prop as navigation is handled internally
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const searchBarRef = useRef(null); // Ref for detecting clicks outside
  const navigate = useNavigate(); // Initialize navigate

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
    setSearchResults({ products: [], categories: [] }); // Clear previous results
    setResultsError(null); // Clear previous errors
  };

  const handleCloseSearch = () => {
    setShowSearchModal(false);
  };

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchResults(searchTerm.trim());
      } else {
        setSearchResults({ products: [], categories: [] }); // Clear results if search term is empty
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchResults = useCallback(async (query) => {
    setLoadingResults(true);
    setResultsError(null);
    try {
      // Fetch products
      const productResponse = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(query)}&limit=5`);
      if (!productResponse.ok) {
        throw new Error(`HTTP error! status: ${productResponse.status}`);
      }
      const productData = await productResponse.json();
      const fetchedProducts = productData.products || [];

      // Fetch all categories and filter client-side (as category API doesn't support search directly)
      const categoryResponse = await fetch('http://localhost:5000/api/categories');
      if (!categoryResponse.ok) {
        throw new Error(`HTTP error! status: ${categoryResponse.status}`);
      }
      const allCategories = await categoryResponse.json();
      const fetchedCategories = allCategories.filter(cat => 
        cat.name.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults({ products: fetchedProducts, categories: fetchedCategories });

    } catch (error) {
      console.error('Error fetching search results:', error);
      setResultsError('Failed to fetch search results. Please try again.');
      setSearchResults({ products: [], categories: [] });
    } finally {
      setLoadingResults(false);
    }
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSearchModal(false); // Close modal after navigation
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
    setShowSearchModal(false); // Close modal after navigation
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If user presses enter, and there are results, navigate to the first product or category
    if (searchResults.products.length > 0) {
      handleProductClick(searchResults.products[0]._id);
    } else if (searchResults.categories.length > 0) {
      handleCategoryClick(searchResults.categories[0].name);
    } else if (searchTerm.trim()) {
      // If no specific results but a search term, navigate to shop page with search
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearchModal(false);
    }
  };


  return (
    <>
      {/* Icon in the navbar that triggers the search modal */}
      <FaSearch 
        style={{ fontSize: '1.5rem', color: '#555', cursor: 'pointer', transition: 'color 0.3s ease' }} 
        onClick={handleOpenSearch} 
      />

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
              <SearchInputWrapper>
                <input
                  type="text"
                  placeholder="Search products or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus 
                />
                <button type="submit" aria-label="Search">
                  <FaSearch />
                </button>
                <button type="button" onClick={handleCloseSearch} className="close-button" aria-label="Close Search">
                  <FaTimes />
                </button>
              </SearchInputWrapper>

              {searchTerm.trim() && ( // Only show results container if there's a search term
                <SearchResultsContainer>
                  {loadingResults ? (
                    <LoadingSpinner />
                  ) : resultsError ? (
                    <SearchError>{resultsError}</SearchError>
                  ) : (
                    <>
                      {searchResults.products.length > 0 && (
                        <>
                          <h4 style={{ padding: '5px 15px', color: '#6c63ff', margin: '0', fontSize: '1.1rem' }}>Products</h4>
                          {searchResults.products.map(product => (
                            <SearchResultItem key={product._id} onClick={() => handleProductClick(product._id)}>
                              <img src={product.image} alt={product.name} onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/60x60/cccccc/333333?text=No+Img"; }} />
                              <div className="info">
                                <div className="name">{product.name}</div>
                                <div className="price">${product.price.toFixed(2)}</div>
                              </div>
                            </SearchResultItem>
                          ))}
                        </>
                      )}

                      {searchResults.categories.length > 0 && (
                        <>
                          <h4 style={{ padding: '5px 15px', color: '#6c63ff', margin: '10px 0 0 0', fontSize: '1.1rem' }}>Categories</h4>
                          {searchResults.categories.map(category => (
                            <SearchResultItem key={category._id} onClick={() => handleCategoryClick(category.name)}>
                              <div className="info">
                                <div className="category-name">{category.name}</div>
                              </div>
                            </SearchResultItem>
                          ))}
                        </>
                      )}

                      {searchResults.products.length === 0 && searchResults.categories.length === 0 && !loadingResults && (
                        <NoResultsMessage>No results found for "{searchTerm}".</NoResultsMessage>
                      )}
                    </>
                  )}
                </SearchResultsContainer>
              )}
            </SearchBarContainer>
          </SearchModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchBar;
