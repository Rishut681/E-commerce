import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../store/auth'; // To get auth token
import { toast } from "react-toastify";

// --- Styled Components ---

const FormTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 700;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.95rem;
    color: #555;
    font-weight: 600;
  }

  input[type="text"],
  input[type="number"],
  textarea,
  select {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    color: #333;
    background-color: #f8f8f8;
    transition: all 0.3s ease;

    &:focus {
      border-color: #6c63ff;
      box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.2);
      background-color: white;
      outline: none;
    }
    &::placeholder {
      color: #999;
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const SubmitButton = styled(motion.button)`
  background-color: ${props => props.$update ? '#007bff' : '#28a745'}; /* Blue for update, green for create */
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
  box-shadow: 0 4px 10px ${props => props.$update ? 'rgba(0, 123, 255, 0.2)' : 'rgba(40, 167, 69, 0.2)'};

  &:hover {
    background-color: ${props => props.$update ? '#0056b3' : '#218838'};
    transform: translateY(-2px);
    box-shadow: 0 6px 15px ${props => props.$update ? 'rgba(0, 123, 255, 0.3)' : 'rgba(40, 167, 69, 0.3)'};
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px ${props => props.$update ? 'rgba(0, 123, 255, 0.2)' : 'rgba(40, 167, 69, 0.2)'};
  }

  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CancelButton = styled(motion.button)`
  background-color: #6c757d; /* Gray for cancel */
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

  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: -10px;
  margin-bottom: 10px;
  text-align: center;
  width: 100%;
`;

const Spinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  margin-left: 10px;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


// --- ProductForm Component ---
const ProductForm = ({ productToEdit, onClose, onSuccess, categories }) => {
  const { authToken } = useAuth(); // Get auth token for API calls
  const isEditing = !!productToEdit; // Check if we are in edit mode
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    category: '' // Category ID
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Populate form if in edit mode
  useEffect(() => {
    if (isEditing && productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        stock: productToEdit.stock || '',
        image: productToEdit.image || '',
        // Ensure category is the ID, not the populated object
        category: productToEdit.category?._id || productToEdit.category || ''
      });
    } else {
      // Set default category to the first available if adding new product
      if (categories.length > 0) {
        setFormData(prev => ({ ...prev, category: categories[0]._id }));
      }
    }
  }, [isEditing, productToEdit, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!formData.name || !formData.price || !formData.category) {
      setError('Name, Price, and Category are required.');
      setLoading(false);
      return;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        setError('Price must be a positive number.');
        setLoading(false);
        return;
    }
    if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
        setError('Stock must be a non-negative integer.');
        setLoading(false);
        return;
    }


    try {
      const url = isEditing 
        ? `http://localhost:5000/api/products/${productToEdit._id}`
        : 'http://localhost:5000/api/products';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // Send the admin's auth token
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (response.ok) {
        toast(responseData.message || `Product ${isEditing ? 'updated' : 'created'} successfully!`);
        onSuccess(); // Call onSuccess callback to refresh list and close modal
      } else {
        setError(responseData.message || `Failed to ${isEditing ? 'update' : 'create'} product.`);
      }

    } catch (apiError) {
      console.error('API call error:', apiError);
      setError('Could not connect to server or network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</FormTitle>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FormGroup>
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Nexa Wireless Earbuds"
          required
          disabled={loading}
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed description of the product..."
          disabled={loading}
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="price">Price ($):</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="e.g., 79.99"
          step="0.01" // Allow decimal values
          required
          disabled={loading}
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="stock">Stock:</label>
        <input
          type="number"
          id="stock"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="e.g., 150"
          min="0"
          required
          disabled={loading}
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="image">Image URL:</label>
        <input
          type="text"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="e.g., https://example.com/product.jpg"
          disabled={loading}
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="">Select a Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </FormGroup>

      <FormButtons>
        <CancelButton onClick={onClose} disabled={loading}>Cancel</CancelButton>
        <SubmitButton type="submit" disabled={loading} $update={isEditing}>
          {loading ? (
            <>
              {isEditing ? 'Updating...' : 'Adding...'} <Spinner />
            </>
          ) : (
            isEditing ? 'Update Product' : 'Add Product'
          )}
        </SubmitButton>
      </FormButtons>
    </StyledForm>
  );
};

export default ProductForm;
