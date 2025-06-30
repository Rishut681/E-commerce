import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion'; // For grid animations

import ProductCard from './ProductCard'; // Import individual ProductCard

// --- Styled Components ---
const GridContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive grid */
  gap: 25px; /* Gap between product cards */
  padding: 20px; /* Inner padding for the grid */

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Single column on small screens */
    padding: 10px;
    gap: 15px;
  }
`;

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};


// --- ProductGrid Component ---
const ProductGrid = ({ products }) => {
  if (!products || products.length === 0) {
    return null; // Or a message "No products to display"
  }

  return (
    <GridContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map(product => (
        <ProductCard key={product._id} product={product} variants={itemVariants} />
      ))}
    </GridContainer>
  );
};

export default ProductGrid;
