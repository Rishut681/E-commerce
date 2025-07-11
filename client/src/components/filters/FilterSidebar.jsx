import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaFilter, FaRedo, FaChevronDown, FaChevronUp, FaThList } from 'react-icons/fa'; // Added FaThList for 'All Categories' link
import { useNavigate } from 'react-router-dom'; // Import useNavigate for the 'All Categories' link

// --- Styled Components ---

const SidebarContainer = styled(motion.div)`
  flex: 1; 
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  min-width: 250px; 
  max-width: 300px; 
  height: fit-content; 
  position: sticky; 
  top: 90px; 

  @media (max-width: 1024px) {
    width: 100%; 
    max-width: none; 
    position: static; 
    padding: 15px; 
  }
`;

const SidebarHeader = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 20px;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 25px;

  h3 {
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer; 
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
  }

  .collapsed {
    display: none;
  }
`;

const PriceRangeInputs = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  input {
    width: 100px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #333;
    background-color: #f8f8f8;
    transition: all 0.3s ease;

    &:focus {
      border-color: #6c63ff;
      box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.2);
      background-color: white;
      outline: none;
    }
  }

  span {
    color: #666;
    font-size: 1rem;
  }
`;

const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CategoryItem = styled.li`
  margin-bottom: 10px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 1rem;
    color: #333;
    transition: color 0.2s ease;

    &:hover {
      color: #6c63ff;
    }

    input[type="radio"] {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border: 2px solid #ccc;
      border-radius: 50%;
      outline: none;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:checked {
        background-color: #6c63ff;
        border-color: #6c63ff;
      }
      
      &:checked::before {
        content: '';
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
      }
    }
  }
`;

// NEW: Styled link for "All Categories" navigation
const AllCategoriesLink = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #6c63ff; /* Highlighted color */
  font-weight: 600;
  margin-top: 15px;
  padding: 8px 0;
  border-top: 1px solid #eee; /* Separator */
  transition: color 0.2s ease;

  &:hover {
    color: #5a54d4;
  }

  svg {
    font-size: 1.1rem;
  }
`;

const ResetButton = styled(motion.button)`
  background-color: #6c757d; 
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(108, 117, 125, 0.2);

  &:hover {
    background-color: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(108, 117, 125, 0.3);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(108, 117, 125, 0.2);
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const LoadingMessage = styled.p`
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  padding: 10px 0;
`;


// --- FilterSidebar Component ---

const FilterSidebar = ({ currentFilters, onFilterChange, onResetFilters }) => {
  const navigate = useNavigate(); // Hook for navigation

  const [minPrice, setMinPrice] = useState(currentFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice);
  const [category, setCategory] = useState(currentFilters.category);

  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryFetchError, setCategoryFetchError] = useState(null);

  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  const [isPriceCollapsed, setIsPriceCollapsed] = useState(false);

  // NEW: Number of categories to show initially
  const categoriesToShowCount = 6; 


  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryFetchError(null);
      try {
        const response = await fetch('https://e-commerce-44nm.onrender.com/api/categories'); // Using localhost
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Add an "All" option at the beginning of the *fetched* categories for the filter
        setAvailableCategories([{ _id: 'all', name: 'All' }, ...data]);
      } catch (error) {
        console.error("Error fetching categories for Filter Sidebar:", error);
        setCategoryFetchError("Failed to load categories.");
        setAvailableCategories([{ _id: 'all', name: 'All' }]); 
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Update local state when currentFilters prop changes (e.g., from URL updates)
  useEffect(() => {
    setMinPrice(currentFilters.minPrice);
    setMaxPrice(currentFilters.maxPrice);
    setCategory(currentFilters.category);
  }, [currentFilters]);

  // Handlers
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    onFilterChange({ category: newCategory });
  };

  const handlePriceChange = () => {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if ((minPrice === '' || !isNaN(min)) && (maxPrice === '' || !isNaN(max))) {
        if (!isNaN(min) && !isNaN(max) && min > max) {
            console.warn("Min price cannot be greater than max price.");
            return;
        }
        onFilterChange({ minPrice, maxPrice });
    }
  };

  const handleMinPriceInputChange = (e) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceInputChange = (e) => {
    setMaxPrice(e.target.value);
  };

  const handleReset = () => {
    onResetFilters();
    setMinPrice('');
    setMaxPrice('');
    setCategory('all');
  };

  const handleNavigateToAllCategories = () => {
    navigate('/categories'); // Navigate to the dedicated categories page
  };


  return (
    <SidebarContainer
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <SidebarHeader><FaFilter /> Filters</SidebarHeader>

      {/* Category Filter */}
      <FilterGroup>
        <h3 onClick={() => setIsCategoryCollapsed(!isCategoryCollapsed)}>
          Category {isCategoryCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </h3>
        <div className={isCategoryCollapsed ? 'collapsed' : ''}>
          {loadingCategories ? (
            <LoadingMessage>Loading categories...</LoadingMessage>
          ) : categoryFetchError ? (
            <ErrorMessage>{categoryFetchError}</ErrorMessage>
          ) : (
            <>
              <CategoryList>
                {/* Always show "All" for shop filtering */}
                <CategoryItem key="all">
                  <label>
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={category === "all"}
                      onChange={handleCategoryChange}
                    />
                    All
                  </label>
                </CategoryItem>

                {/* Show first 'categoriesToShowCount' fetched categories */}
                {availableCategories.slice(1, categoriesToShowCount + 1).map((cat) => ( // Start from index 1 to skip the internal 'All'
                  <CategoryItem key={cat._id}>
                    <label>
                      <input
                        type="radio"
                        name="category"
                        value={cat.name} 
                        checked={category === cat.name}
                        onChange={handleCategoryChange}
                      />
                      {cat.name}
                    </label>
                  </CategoryItem>
                ))}
              </CategoryList>

              {/* NEW: "All Categories" link for navigation */}
              {availableCategories.length > categoriesToShowCount + 1 && ( // Only show if there are more categories than displayed
                <AllCategoriesLink onClick={handleNavigateToAllCategories}>
                  <FaThList /> All Categories
                </AllCategoriesLink>
              )}
            </>
          )}
        </div>
      </FilterGroup>

      {/* Price Range Filter */}
      <FilterGroup>
        <h3 onClick={() => setIsPriceCollapsed(!isPriceCollapsed)}>
          Price Range {isPriceCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </h3>
        <div className={isPriceCollapsed ? 'collapsed' : ''}>
          <PriceRangeInputs>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={handleMinPriceInputChange}
              onBlur={handlePriceChange} 
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={handleMaxPriceInputChange}
              onBlur={handlePriceChange} 
            />
          </PriceRangeInputs>
        </div>
      </FilterGroup>

      <ResetButton 
        onClick={handleReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaRedo /> Reset Filters
      </ResetButton>
    </SidebarContainer>
  );
};

export default FilterSidebar;
