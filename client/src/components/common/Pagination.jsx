import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// --- Styled Components ---
const PaginationContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-wrap: wrap; /* Allow wrapping of page numbers */
    padding: 10px;
    gap: 5px;
  }
`;

// Changed 'isActive' to '$isActive' to make it a transient prop
const PageButton = styled.button`
  background-color: ${props => props.$isActive ? '#6c63ff' : '#f0f2f5'};
  color: ${props => props.$isActive ? 'white' : '#555'};
  border: 1px solid ${props => props.$isActive ? '#6c63ff' : '#e0e0e0'};
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px; /* Ensure consistent width */
  text-align: center;

  &:hover:not(:disabled) {
    background-color: ${props => props.$isActive ? '#5a54d4' : '#e0e0e0'};
    color: ${props => props.$isActive ? 'white' : '#333'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  svg {
    vertical-align: middle;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.9rem;
    min-width: 35px;
  }
`;

// --- Pagination Component ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  // Logic to show a limited number of page buttons around current page
  const maxPageButtons = 5; // e.g., show current, +/- 2 pages, plus first/last if far

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, currentPage + Math.floor(maxPageButtons / 2));

  // Adjust if at the beginning or end
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  if (startPage === 1 && endPage < maxPageButtons) {
    endPage = Math.min(totalPages, maxPageButtons);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <PaginationContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <PageButton 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        <FaChevronLeft /> Prev
      </PageButton>

      {startPage > 1 && (
        <>
          <PageButton onClick={() => onPageChange(1)} $isActive={1 === currentPage}>1</PageButton>
          {startPage > 2 && <span>...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <PageButton
          key={number}
          onClick={() => onPageChange(number)}
          $isActive={number === currentPage} // Changed to $isActive
        >
          {number}
        </PageButton>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span>...</span>}
          <PageButton onClick={() => onPageChange(totalPages)} $isActive={totalPages === currentPage}>{totalPages}</PageButton>
        </>
      )}

      <PageButton 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        Next <FaChevronRight />
      </PageButton>
    </PaginationContainer>
  );
};

export default Pagination;
