import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSort } from 'react-icons/fa'; // Icon for sort

// --- Styled Components ---
const DropdownContainer = styled(motion.div)`
  position: relative;
  min-width: 200px; /* Slightly wider */
  display: flex;
  align-items: center;
  gap: 10px; /* Gap between icon and select */
  background-color: #fff;
  border: 2px solid #e0e0e0; /* Consistent border */
  border-radius: 10px; /* Consistent rounded corners */
  padding: 5px 10px; /* Adjusted padding */
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #6c63ff;
    box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.25);
  }

  @media (max-width: 768px) {
    width: 100%; 
    min-width: unset;
  }
`;

const DropdownSelect = styled.select`
  flex-grow: 1; /* Allow select to take available space */
  padding: 8px 0px; /* Adjusted padding, arrow handles right spacing */
  border: none; /* No default border */
  outline: none;
  font-size: 1rem;
  background-color: transparent; /* Transparent background */
  appearance: none; 
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  color: #333; /* ENSURE TEXT IS DARK */
  transition: color 0.2s ease;

  &:focus {
    outline: none; /* Remove default focus outline as container handles it */
  }
`;

const DropdownIcon = styled.div`
  color: #6c63ff; /* Icon color */
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;


// --- SortDropdown Component ---
const SortDropdown = ({ currentSort, onSortChange }) => {
  const options = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'price_asc', label: 'Price (Low to High)' },
    { value: 'price_desc', label: 'Price (High to Low)' },
    { value: 'newest', label: 'Newest Arrivals' },
  ];

  const handleChange = (e) => {
    onSortChange(e.target.value);
  };

  return (
    <DropdownContainer
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <DropdownIcon>
        <FaSort />
      </DropdownIcon>
      <DropdownSelect value={currentSort} onChange={handleChange}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </DropdownSelect>
    </DropdownContainer>
  );
};

export default SortDropdown;
