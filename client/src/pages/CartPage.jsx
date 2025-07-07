import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaArrowRight, FaSpinner } from 'react-icons/fa'; // Added FaSpinner
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth'; // Import useAuth to get authToken

// --- Styled Components ---

const CartPageContainer = styled.div`
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Arial', sans-serif;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 30px;
  flex-grow: 1;
  display: flex;
  gap: 30px;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 0 15px;
    margin: 20px auto;
  }
`;

const CartItemsContainer = styled(motion.div)`
  flex: 2; /* Takes 2/3 of the space */
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;

  h2 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 25px;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    padding: 20px;
    h2 {
      font-size: 1.8rem;
      margin-bottom: 20px;
    }
  }
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px 0;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ItemDetails = styled.div`
  flex-grow: 1;

  h3 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 5px;
    font-weight: 600;
  }

  p {
    font-size: 0.9rem;
    color: #777;
  }

  .item-price {
    font-size: 1rem;
    color: #6c63ff;
    font-weight: bold;
    margin-top: 5px;
  }
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  button {
    background-color: #f0f2f5;
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
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

  span {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    min-width: 20px;
    text-align: center;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #c82333;
  }
`;

const CartSummaryContainer = styled(motion.div)`
  flex: 1; /* Takes 1/3 of the space */
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  height: fit-content; /* Adjust height to content */

  h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 25px;
    font-weight: 700;
  }

  div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 1rem;
    color: #555;
  }

  .total {
    font-size: 1.4rem;
    font-weight: bold;
    color: #333;
    border-top: 1px solid #eee;
    padding-top: 15px;
    margin-top: 15px;
  }

  button {
    width: 100%;
    background-color: #6c63ff;
    color: white;
    padding: 15px 20px;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;

    &:hover {
      background-color: #5a54d4;
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 20px;
    h2 {
      font-size: 1.6rem;
      margin-bottom: 20px;
    }
    .total {
      font-size: 1.2rem;
    }
  }
`;

const EmptyCartMessage = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #777;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  flex-grow: 1; /* Allow it to take full width */
  justify-content: center; /* Center content vertically */

  svg {
    font-size: 3rem;
    color: #ccc;
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
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #5a54d4;
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #666;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  svg {
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorDisplay = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #dc3545;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// --- Framer Motion Variants ---
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const summaryVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};


// --- CartPage Component ---
const CartPage = () => {
  const navigate = useNavigate();
  const { authToken, isLoggedIn } = useAuth(); // Get authToken and isLoggedIn from AuthContext

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !authToken) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setCartItems(data.cart?.items || []); // Set items, handle empty cart case
      } else {
        setError(data.message || 'Failed to fetch cart.');
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Network error or server unavailable.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [authToken, isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (productId, delta) => {
    if (!isLoggedIn || !authToken) {
      alert('Please log in to manage your cart.');
      navigate('/login');
      return;
    }

    const currentItem = cartItems.find(item => item.productId === productId);
    if (!currentItem) return;

    const newQuantity = Math.max(1, currentItem.quantity + delta);

    // Optimistic update
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity on server.');
      }
      // Re-fetch to ensure consistency, or update based on response if response contains full cart
      fetchCart(); 
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message || 'Failed to update item quantity.');
      fetchCart(); // Revert to server state on error
    }
  };

  const removeItem = async (productId) => {
    if (!isLoggedIn || !authToken) {
      alert('Please log in to manage your cart.');
      navigate('/login');
      return;
    }

    // Optimistic update
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from server.');
      }
      // Re-fetch to ensure consistency
      fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message || 'Failed to remove item from cart.');
      fetchCart(); // Revert to server state on error
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = cartItems.length > 0 ? 15.00 : 0; // Dummy shipping
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  const handleProceedToCheckout = () => {
    alert('Proceeding to checkout! (This is a placeholder action)');
    // In a real app, you would navigate to a checkout page:
    // navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  if (!isLoggedIn) {
    return (
      <CartPageContainer>
        <DashboardNavbar />
        <ContentWrapper>
          <EmptyCartMessage>
            <FaShoppingCart />
            <p>Please log in to view and manage your cart.</p>
            <button onClick={() => navigate('/login')}>Login Now</button>
          </EmptyCartMessage>
        </ContentWrapper>
        <Footer />
      </CartPageContainer>
    );
  }

  return (
    <CartPageContainer>
      <DashboardNavbar />
      <AnimatePresence mode="wait">
        <ContentWrapper
          key="cart-content"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={pageVariants}
        >
          {loading ? (
            <LoadingMessage>
              <FaSpinner />
              <p>Loading your cart...</p>
            </LoadingMessage>
          ) : error ? (
            <ErrorDisplay>
              <p>{error}</p>
              <button onClick={fetchCart}>Retry</button>
            </ErrorDisplay>
          ) : cartItems.length === 0 ? (
            <EmptyCartMessage>
              <FaShoppingCart />
              <p>Your cart is empty.</p>
              <button onClick={handleContinueShopping}>Continue Shopping</button>
            </EmptyCartMessage>
          ) : (
            <>
              <CartItemsContainer
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
              >
                <h2>Your Shopping Cart</h2>
                <AnimatePresence>
                  {cartItems.map(item => (
                    <motion.div key={item.productId} variants={itemVariants} initial="hidden" animate="visible" exit="exit">
                      <CartItem>
                        {/* Use item.image directly from cart item */}
                        <ItemImage src={item.image} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/cccccc/333333?text=No+Img"; }} />
                        <ItemDetails>
                          <h3>{item.name}</h3>
                          <p className="item-price">${item.price.toFixed(2)}</p>
                        </ItemDetails>
                        <QuantityControls>
                          <button onClick={() => updateQuantity(item.productId, -1)} disabled={item.quantity <= 1}>
                            <FaMinus />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)}>
                            <FaPlus />
                          </button>
                        </QuantityControls>
                        <RemoveButton onClick={() => removeItem(item.productId)}>
                          <FaTrash />
                        </RemoveButton>
                      </CartItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CartItemsContainer>

              <CartSummaryContainer
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={summaryVariants}
              >
                <h2>Order Summary</h2>
                <div>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <span>Shipping:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div>
                  <span>Tax ({taxRate * 100}%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button onClick={handleProceedToCheckout}>
                  Proceed to Checkout <FaArrowRight />
                </button>
              </CartSummaryContainer>
            </>
          )}
        </ContentWrapper>
      </AnimatePresence>
      <Footer />
    </CartPageContainer>
  );
};

export default CartPage;
