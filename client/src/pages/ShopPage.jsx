import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom'; 

// Import existing components
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';

// Import new common components
import SortDropdown from '../components/common/SortDropdown';
import Pagination from '../components/common/Pagination';

// Import new product-specific components
import ProductGrid from '../components/products/ProductGrid';

// Import new filter component
import FilterSidebar from '../components/filters/FilterSidebar';

// Optional: For loading indicator
import { FaSpinner } from 'react-icons/fa';

// --- Styled Components for ShopPage Layout ---

const ShopPageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Arial', sans-serif;
`;

// Wrapper for the main content area (filters, products, pagination)
const MainContentWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  display: flex; /* Flex for sidebar layout */
  gap: 30px;
  flex-grow: 1; /* Allows content to take up available space */

  @media (max-width: 1024px) {
    flex-direction: column; /* Stack sidebar and product area on tablets/laptops */
    gap: 25px; /* Slightly reduced gap when stacked */
  }

  @media (max-width: 768px) {
    padding: 15px;
    gap: 20px;
  }
`;

const ProductsSection = styled.div`
  flex: 3; /* Product area takes more space */
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px; /* Internal padding for products section */
  background-color: #ffffff; /* White background for product display area */
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    flex: auto; /* Auto size when stacked */
    padding: 15px;
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: flex-end; /* Aligned to right, as search is gone */
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  gap: 15px;
  margin-bottom: 20px; /* Space below controls bar */

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ProductsHeader = styled.h1`
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 15px;
  }
`;

const LoadingSpinner = styled(FaSpinner)`
  font-size: 3rem;
  color: #6c63ff;
  animation: spin 1s linear infinite;
  margin: 50px auto;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NoProductsMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  padding: 50px;
`;


// --- Framer Motion Variants for page entry ---
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};


// --- ShopPage Component ---

const ShopPage = () => {
  const location = useLocation(); 

  const getInitialFilters = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      category: params.get('category') || 'all',
      minPrice: params.get('price[gte]') || '',
      maxPrice: params.get('price[lte]') || '',
      search: params.get('search') || '' 
    };
  }, [location.search]);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  const initialFilters = getInitialFilters(); 
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(getInitialFilters());
    setCurrentPage(1); 
  }, [location.search, getInitialFilters]);


  const [sortOrder, setSortOrder] = useState('name_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // --- Function to fetch products from backend ---
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (filters.category && filters.category !== 'all') {
      queryParams.append('category', filters.category);
    }
    if (filters.minPrice) {
      queryParams.append('price[gte]', filters.minPrice);
    }
    if (filters.maxPrice) {
      queryParams.append('price[lte]', filters.maxPrice);
    }
    if (filters.search) { 
      queryParams.append('search', filters.search);
    }
    queryParams.append('sort', sortOrder);
    queryParams.append('page', currentPage);
    queryParams.append('limit', itemsPerPage);

    try {
      const response = await fetch(`https://e-commerce-44nm.onrender.com/api/products?${queryParams.toString()}`); 
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setTotalProducts(data.totalProducts || 0);

    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoadingProducts(false);
    }
  }, [filters, sortOrder, currentPage, itemsPerPage]); 

  // --- useEffect to trigger product fetching ---
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); 


  // --- Handlers for changes in filters, sort, pagination ---

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    setCurrentPage(1); 
  }, []);

  const handleSortChange = useCallback((newSortOrder) => {
    setSortOrder(newSortOrder);
    setCurrentPage(1); 
  }, []);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
    setSortOrder('name_asc');
    setCurrentPage(1);
  }, []);


  return (
    <ShopPageContainer
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <DashboardNavbar />

      <MainContentWrapper>
        {/* Filter Sidebar - REMOVED availableCategories prop */}
        <FilterSidebar 
          currentFilters={filters} 
          onFilterChange={handleFilterChange} 
          onResetFilters={handleResetFilters} 
          // availableCategories={['all', 'Electronics', 'Wearables', 'Home & Kitchen', 'Apparel']} // REMOVED
        />

        {/* Products Display Section */}
        <ProductsSection>
          <ProductsHeader>Our Latest Collection</ProductsHeader>
          
          <ControlsBar>
            <SortDropdown currentSort={sortOrder} onSortChange={handleSortChange} />
          </ControlsBar>

          {loadingProducts ? (
            <LoadingSpinner />
          ) : error ? (
            <NoProductsMessage>{error}</NoProductsMessage>
          ) : products.length === 0 ? (
            <NoProductsMessage>No products found matching your criteria.</NoProductsMessage>
          ) : (
            <ProductGrid products={products} />
          )}

          {totalProducts > itemsPerPage && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </ProductsSection>
      </MainContentWrapper>

      <Footer />
    </ShopPageContainer>
  );
};

export default ShopPage;
