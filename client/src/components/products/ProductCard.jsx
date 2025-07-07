import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart, FaSpinner } from 'react-icons/fa'; // Removed FaHeart
import { useAuth } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// --- Styled Components ---
const ProductCardContainer = styled(motion.div)`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  text-align: left;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  box-sizing: border-box;

  width: calc((100% / var(--products-per-view)) - (var(--gap-count) * var(--gap-size) / var(--products-per-view)));
  flex-shrink: 0;
  min-height: 350px;
  min-width: 280px;


  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
`;

const ProductInfo = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1; 
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.3;
  min-height: 2.6em; 
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.p`
  font-size: 1.15rem;
  color: #6c63ff;
  font-weight: bold;
  margin-bottom: 10px;
`;

const ProductRating = styled.div`
  color: #f39c12; 
  font-size: 0.9rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 3px;

  .empty-star {
    color: #e0e0e0;
  }
`;

const ActionsBar = styled.div`
  padding: 10px 15px 15px;
  display: flex;
  gap: 10px;
  justify-content: center; /* Centered as only one button */
  align-items: center;
  border-top: 1px solid #eee;
`;

const AddToCartButton = styled(motion.button)`
  background-color: #6c63ff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  flex-grow: 1; 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 3px 8px rgba(108, 99, 255, 0.2);

  &:hover {
    background-color: #5a54d4;
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(108, 99, 255, 0.3);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(108, 99, 255, 0.2);
  }

  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  margin-left: 5px;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


// --- ProductCard Component ---
const ProductCard = React.forwardRef(({ product, variants, onCartUpdate }, ref) => {
  const { isLoggedIn, authToken } = useAuth();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);

  const displayRating = product.rating || 4.0; 

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      toast('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }

    setAddingToCart(true);

    try {
      // Changed endpoint from /api/user/cart to /api/cart
      const response = await fetch('http://localhost:5000/api/cart', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast(data.message || `"${product.name}" added to cart successfully!`);
        if (onCartUpdate) {
          onCartUpdate();
        }
      } else {
        toast(data.message || 'Failed to add item to cart.');
        console.error('Error adding to cart:', data.message);
      }
    } catch (error) {
      console.error('Network error adding to cart:', error);
      toast('Network error: Could not add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <ProductCardContainer variants={variants} onClick={handleViewDetails} ref={ref}>
      <ProductImage src={product.image} alt={product.name} onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/cccccc/333333?text=No+Image"; }} />
      <ProductInfo>
        <ProductName>{product.name}</ProductName>
        <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
        <ProductRating>
          {Array.from({ length: 5 }, (_, i) => (
            <FaStar 
              key={i} 
              color={i < Math.floor(displayRating) ? "#f39c12" : "#e0e0e0"} 
              className={i < Math.floor(displayRating) ? "" : "empty-star"}
            />
          ))} 
          <span>({displayRating.toFixed(1)})</span>
        </ProductRating>
      </ProductInfo>
      <ActionsBar>
        <AddToCartButton onClick={handleAddToCart} disabled={addingToCart}>
          {addingToCart ? (
            <>
              Adding... <Spinner />
            </>
          ) : (
            <>
              <FaShoppingCart /> Add to Cart
            </>
          )}
        </AddToCartButton>
      </ActionsBar>
    </ProductCardContainer>
  );
});

export default ProductCard;
