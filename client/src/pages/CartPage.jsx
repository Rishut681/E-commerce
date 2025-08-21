import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSpinner, FaTrash, FaPlus, FaMinus, FaSadTear, FaBoxOpen } from 'react-icons/fa';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { useAuth } from '../store/auth';
import { toast } from 'react-toastify';

// --- Styled Components ---

const CartPageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Arial', sans-serif;
`;

const MainContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (max-width: 768px) {
    padding: 15px;
    gap: 20px;
  }
`;

const PageHeader = styled.h1`
  font-size: 2.8rem;
  color: #333;
  text-align: center;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 2.2rem;
    gap: 10px;
    margin-bottom: 20px;
  }
`;

const CartSummaryContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr; /* Cart items on left, summary on right */
  gap: 30px;
  align-items: flex-start; /* Align top */

  @media (max-width: 992px) {
    grid-template-columns: 1fr; /* Stack columns on smaller screens */
  }
`;

const CartItemsList = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const CartItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .item-details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .item-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }

  .item-price {
    font-size: 1rem;
    color: #6c63ff;
    font-weight: bold;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
  }

  .quantity-button {
    background-color: #f0f2f5;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 1rem;
    color: #555;
    transition: all 0.2s ease;

    &:hover {
      background-color: #e0e0e0;
      color: #333;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .item-quantity {
    min-width: 30px;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .remove-button {
    background: none;
    border: none;
    color: #dc3545;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: auto; /* Push to the right */
    transition: color 0.2s ease;

    &:hover {
      color: #c82333;
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    img {
      width: 100%;
      height: 150px;
    }
    .item-details {
      width: 100%;
    }
    .remove-button {
      margin-left: 0;
      align-self: flex-end; /* Align to the right within the column */
    }
  }
`;

const CartSummaryCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: #555;
    padding: 5px 0;
  }

  .summary-total {
    font-size: 1.3rem;
    font-weight: bold;
    color: #333;
    border-top: 1px solid #eee;
    padding-top: 15px;
    margin-top: 10px;
  }

  button {
    background-color: #6c63ff;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 4px 10px rgba(108, 99, 255, 0.2);

    &:hover {
      background-color: #5a54d4;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(108, 99, 255, 0.3);
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
  }

  .clear-cart-button {
    background-color: #dc3545;
    margin-top: 10px;

    &:hover {
      background-color: #c82333;
    }
  }
`;

const MessageContainer = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 50px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;

  p {
    font-size: 1.2rem;
    color: #666;
    margin-top: 20px;
  }

  svg {
    font-size: 3rem;
    color: #6c63ff;
  }

  &.error svg {
    color: #dc3545;
  }
`;

const LoginPrompt = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 50px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;

  h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 30px;
  }

  button {
    background-color: #6c63ff;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: #5a54d4;
      transform: translateY(-2px);
    }
  }
`;

// --- Framer Motion Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } }
};


// --- CartPage Component ---

const CartPage = () => {
  // We'll use the user and authToken from the useAuth hook for authentication
  const { isLoggedIn, authToken, isLoadingAuth, fetchCartCount } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !authToken) {
      setLoading(false);
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://e-commerce-44nm.onrender.com/api/cart', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCart(data.cart);
      fetchCartCount();
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart items. Please try again.');
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, authToken, fetchCartCount]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    setUpdatingItemId(productId);
    try {
      const response = await fetch(`https://e-commerce-44nm.onrender.com/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message); // Updated to use a success toast
        fetchCart();
      } else {
        toast.error(data.message || 'Failed to update quantity.'); // Updated to use an error toast
        console.error('Error updating quantity:', data.message);
      }
    } catch (error) {
      console.error('Network error updating quantity:', error);
      toast.error('Network error: Could not update quantity.'); // Updated to use an error toast
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    // Removed the blocking window.confirm dialog
    // A simple toast notification will be used for feedback instead
    setUpdatingItemId(productId);
    try {
      const response = await fetch(`https://e-commerce-44nm.onrender.com/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.info(data.message); // Updated to use an info toast
        fetchCart();
      } else {
        toast.error(data.message || 'Failed to remove item.');
        console.error('Error removing item:', data.message);
      }
    } catch (error) {
      console.error('Network error removing item:', error);
      toast.error('Network error: Could not remove item.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    // Removed the blocking window.confirm dialog
    // A simple toast notification will be used for feedback instead
    setLoading(true);
    try {
      const response = await fetch('https://e-commerce-44nm.onrender.com/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.info(data.message);
        setCart({ user: isLoggedIn ? authToken : null, items: [], totalAmount: 0 });
        fetchCartCount();
      } else {
        toast.error(data.message || 'Failed to clear cart.');
        console.error('Error clearing cart:', data.message);
      }
    } catch (error) {
      console.error('Network error clearing cart:', error);
      toast.error('Network error: Could not clear cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    // Check if the cart has items before proceeding
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty. Please add items before checking out.');
      return;
    }
    // The previous logic was correct in navigating, so we'll just navigate
    navigate('/checkout');
  };


  if (isLoadingAuth || loading) {
    return (
      <CartPageContainer>
        <DashboardNavbar />
        <MainContentWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
          <MessageContainer>
            <FaSpinner className="animate-spin" />
            <p>Loading cart...</p>
          </MessageContainer>
        </MainContentWrapper>
        <Footer />
      </CartPageContainer>
    );
  }

  if (!isLoggedIn) {
    return (
      <CartPageContainer>
        <DashboardNavbar />
        <MainContentWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
          <LoginPrompt>
            <h2>Access Denied</h2>
            <p>Please log in to view and manage your shopping cart.</p>
            <button onClick={() => navigate('/login')}>Login Now</button>
          </LoginPrompt>
        </MainContentWrapper>
        <Footer />
      </CartPageContainer>
    );
  }

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <CartPageContainer
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <DashboardNavbar />
      <MainContentWrapper>
        <PageHeader><FaShoppingCart /> My Shopping Cart</PageHeader>

        {error ? (
          <MessageContainer className="error">
            <FaSadTear />
            <p>{error}</p>
          </MessageContainer>
        ) : !hasItems ? (
          <MessageContainer>
            <FaBoxOpen />
            <p>Your cart is empty. Start adding some awesome products!</p>
            <button onClick={() => navigate('/shop')} style={{ marginTop: '20px', backgroundColor: '#6c63ff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Go to Shop
            </button>
          </MessageContainer>
        ) : (
          <CartSummaryContainer>
            <CartItemsList>
              {cart.items.map((item) => (
                <CartItemCard key={item.productId._id}>
                  <img src={item.image || 'https://placehold.co/100x100/cccccc/333333?text=No+Image'} alt={item.name} />
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">${item.price.toFixed(2)}</span>
                    <div className="quantity-controls">
                      <button
                        className="quantity-button"
                        onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItemId === item.productId._id}
                      >
                        <FaMinus />
                      </button>
                      <span className="item-quantity">
                        {updatingItemId === item.productId._id ? <FaSpinner className="animate-spin" /> : item.quantity}
                      </span>
                      <button
                        className="quantity-button"
                        onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                        disabled={item.quantity >= item.productId.stock || updatingItemId === item.productId._id}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveItem(item.productId._id)}
                    disabled={updatingItemId === item.productId._id}
                  >
                    <FaTrash />
                  </button>
                </CartItemCard>
              ))}
            </CartItemsList>

            <CartSummaryCard>
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <button className="clear-cart-button" onClick={handleClearCart} disabled={loading}>
                Clear Cart
              </button>
            </CartSummaryCard>
          </CartSummaryContainer>
        )}
      </MainContentWrapper>
      <Footer />
    </CartPageContainer>
  );
};

export default CartPage;
