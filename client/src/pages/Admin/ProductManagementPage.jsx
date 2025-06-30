import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaBoxes } from 'react-icons/fa'; // Icons for actions
import DashboardNavbar from '../../components/DashboardNavbar';
import Footer from '../../components/Footer';
import ProductForm from '../../components/admin/ProductForm'; // Import the new ProductForm
import { useAuth } from '../../store/auth'; // To check admin status
import { useNavigate } from 'react-router-dom';

// --- Styled Components ---

const AdminPageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Arial', sans-serif;
`;

const MainContentWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
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

  @media (max-width: 768px) {
    font-size: 2.2rem;
    gap: 10px;
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: flex-end; /* Align to the right */
  margin-bottom: 20px;
  width: 100%;
`;

const AddProductButton = styled(motion.button)`
  background-color: #28a745; /* Green for add action */
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
  gap: 10px;
  box-shadow: 0 4px 10px rgba(40, 167, 69, 0.2);

  &:hover {
    background-color: #218838;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(40, 167, 69, 0.3);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(40, 167, 69, 0.2);
  }
`;

const ProductListContainer = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  overflow-x: auto; /* Enable horizontal scroll for table on small screens */

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    text-align: left;
    white-space: nowrap; /* Prevent text wrapping in cells */
  }

  th {
    background-color: #f8f8f8;
    color: #555;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.9rem;
  }

  td {
    color: #333;
    font-size: 0.95rem;

    img {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      object-fit: cover;
    }
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background-color: #fdfdfd;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.2s ease;

  color: ${props => {
    if (props.$edit) return '#007bff';
    if (props.$delete) return '#dc3545';
    return '#666';
  }};

  &:hover {
    background-color: ${props => {
      if (props.$edit) return 'rgba(0, 123, 255, 0.1)';
      if (props.$delete) return 'rgba(220, 53, 69, 0.1)';
      return '#f0f0f0';
    }};
    transform: translateY(-1px);
  }
`;

const LoadingSpinner = styled(FaSpinner)`
  font-size: 3rem;
  color: #6c63ff;
  animation: spin 1s linear infinite;
  margin: 50px auto;
  display: block; /* Ensure it takes up space */
`;

const Message = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: ${props => props.$error ? '#dc3545' : '#666'};
  padding: 50px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh; /* Limit height for scrollability */
  overflow-y: auto; /* Enable scroll if content is long */
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  &:hover {
    color: #333;
  }
`;

// --- Framer Motion Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};


// --- ProductManagementPage Component ---

const ProductManagementPage = () => {
  const { isLoggedIn, userData, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Null for new, object for edit

  // Removed dummyCategories. Categories will now be fetched from backend.
  const [categories, setCategories] = useState([]);


  // Frontend protection: Redirect if not logged in or not an admin
  useEffect(() => {
    if (!isLoadingAuth) { 
      if (!isLoggedIn || !userData || userData.role !== 'admin') {
        alert("You must be logged in as an administrator to access this page.");
        navigate('/home'); 
      }
    }
  }, [isLoggedIn, userData, isLoadingAuth, navigate]);

  // NEW: Fetch Categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories'); // Adjust to your backend URL
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data); 
    } catch (error) {
      console.error("Error fetching categories for Product Management page:", error);
      setCategories([]); // Fallback to empty array on error
    }
  }, []);

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/products'); // Using localhost
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products for admin:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetches on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Fetch categories when component mounts
  }, [fetchProducts, fetchCategories]); // Depend on memoized fetch functions


  // Handle opening modal for adding new product
  const handleAddProductClick = () => {
    setEditingProduct(null); 
    setShowModal(true);
  };

  // Handle opening modal for editing product
  const handleEditProductClick = (product) => {
    setEditingProduct(product); 
    setShowModal(true);
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true); 
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, { // Using localhost
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        alert("Product deleted successfully!");
        fetchProducts(); 
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(`Failed to delete product: ${err.message}`);
        setLoading(false); 
      }
    }
  };

  // Handle form submission (new product or update)
  const handleFormSubmitSuccess = () => {
    setShowModal(false); 
    setEditingProduct(null); 
    fetchProducts(); 
  };

  // Render loading state or error for the page itself
  if (isLoadingAuth || loading) { 
    return (
      <AdminPageContainer>
        <DashboardNavbar />
        <MainContentWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner />
          <Message>Loading Product Management...</Message>
        </MainContentWrapper>
        <Footer />
      </AdminPageContainer>
    );
  }

  // Render forbidden access if not admin
  if (!isLoggedIn || !userData || userData.role !== 'admin') {
    return (
      <AdminPageContainer>
        <DashboardNavbar />
        <MainContentWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Message $error>Access Denied. You do not have administrator privileges.</Message>
        </MainContentWrapper>
        <Footer />
      </AdminPageContainer>
    );
  }


  // Main Admin Page Content
  return (
    <AdminPageContainer
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <DashboardNavbar />
      <MainContentWrapper>
        <PageHeader><FaBoxes /> Product Management</PageHeader>

        <ControlsBar>
          <AddProductButton 
            onClick={handleAddProductClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <FaPlus /> Add New Product
          </AddProductButton>
        </ControlsBar>

        <ProductListContainer>
          {error && <Message $error>{error}</Message>}
          {products.length === 0 ? (
            <Message>No products found. Add a new product to get started!</Message>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <motion.tr 
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Ensure NO whitespace between <td> tags or around them */}
                    <td><img src={product.image || 'https://placehold.co/50x50/cccccc/ffffff?text=No+Img'} alt={product.name} /></td>
                    <td>{product.name}</td>
                    <td>{product.category ? product.category.name : 'N/A'}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <ActionButtons>
                        <IconButton 
                          $edit 
                          onClick={() => handleEditProductClick(product)}
                          title="Edit Product"
                        >
                          <FaEdit />
                        </IconButton>
                        <IconButton 
                          $delete 
                          onClick={() => handleDeleteProduct(product._id)}
                          title="Delete Product"
                        >
                          <FaTrash />
                        </IconButton>
                      </ActionButtons>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </StyledTable>
          )}
        </ProductListContainer>
      </MainContentWrapper>

      <Footer />

      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <ModalOverlay>
            <ModalContent
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
              <ProductForm 
                productToEdit={editingProduct} 
                onClose={() => setShowModal(false)} 
                onSuccess={handleFormSubmitSuccess} 
                categories={categories} // Pass fetched categories to the form
              />
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </AdminPageContainer>
  );
};

export default ProductManagementPage;
