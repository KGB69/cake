import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNav/AdminNavigation';
import Head from 'next/head';
import styles from './Admin.module.css';
import ConfirmationModal from '@/components/Modal/ConfirmationModal';
import Pagination from '@/components/Pagination/Pagination';

import { Product } from '@/types/product';

// Default empty product for the form
const emptyProduct: Product = {
  id: '', // Empty ID that will be replaced with a timestamp when adding a new product
  name: '',
  price: 0,
  description: '',
  image: '',
  category: '',
  stock: 0,
  featured: false
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<Product>(emptyProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 5;

  // Check if admin is logged in and load products
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/admin');
    } else {
      fetchProducts();
    }
  }, [router]);

  // Update state and fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Use the direct API path
      const endpoint = `/api/products?page=${currentPage}&limit=${productsPerPage}`;
      console.log(`Fetching products from: ${endpoint}`);
      const res = await fetch(endpoint);
      
      // Log response details
      console.log(`API response status: ${res.status} ${res.statusText}`);
      const contentType = res.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      if (!res.ok) {
        // Try to get error details as text first
        const errorText = await res.text();
        console.error('API error response:', errorText);
        throw new Error(`Error: ${res.status} - ${errorText.substring(0, 100)}...`);
      }
      
      // Get response as text first for debugging
      const responseText = await res.text();
      console.log('Products API response preview:', responseText.substring(0, 100));
      
      // Then parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Failed to parse API response as JSON: ${parseError?.message || 'Unknown parsing error'}`);
      }
      
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      console.log(`Loaded ${data.products?.length || 0} products out of ${data.total || 0} total`);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setCurrentProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'price' || name === 'stock'
          ? parseFloat(value) || 0
          : value
    }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const selectedFile = files[0];
    setUploadedImage(selectedFile);
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleImageUpload = async (): Promise<string | null> => {
    if (!uploadedImage) return null;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', uploadedImage);
    
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        let errorMessage;
        try {
          // Attempt to parse as JSON, but handle HTML responses
          const errorData = await res.json();
          errorMessage = errorData.message || `Error uploading image (${res.status})`;
        } catch (jsonError) {
          // If response isn't JSON, use status text
          console.error('Non-JSON error response:', jsonError);
          errorMessage = `Upload failed: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Use a separate variable for response text before parsing to help debug
      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
        return data.fileUrl;
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError, '\nResponse text:', responseText);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // If uploading a new image
      let imageUrl = currentProduct.image;
      if (uploadedImage) {
        const uploadedUrl = await handleImageUpload();
        if (!uploadedUrl) {
          throw new Error('Failed to upload image');
        }
        imageUrl = uploadedUrl;
      }
      
      const productToSave = {
        ...currentProduct,
        image: imageUrl || '', // Ensure image is never null
        stock: currentProduct.stock || 0,
        featured: currentProduct.featured || false
      };
      
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `/api/products?id=${currentProduct.id}`
        : '/api/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSave)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error saving product');
      }
      
      setSuccess(isEditing ? 'Product updated successfully!' : 'Product added successfully!');
      setCurrentProduct(emptyProduct);
      setIsEditing(false);
      fetchProducts(); // Refresh product list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setError('');
    setSuccess('');
    setImagePreview(product.image);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Scroll to form
    document.getElementById('productForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openDeleteModal = (id: string, productName?: string) => {
    console.debug('Attempting to delete product with ID:', id, 'Name:', productName);
    
    // Check for empty ID
    if (!id) {
      console.warn('Product has an empty ID:', productName);
    }
    
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    // For products with empty IDs, productToDelete will be an empty string
    // which is falsy but valid for our delete operation
    if (productToDelete === null || productToDelete === undefined) {
      console.error('No product ID to delete (null or undefined)');
      setIsDeleteModalOpen(false);
      return;
    }
    
    try {
      console.debug('Sending delete request for product ID:', productToDelete);
      
      // Special handling for empty ID products
      let endpoint, method;
      if (productToDelete === '') {
        // Use the special endpoint for empty IDs
        endpoint = `/api/products/empty-id`;
        method = 'DELETE';
      } else {
        // For normal product deletion, include ID in the body
        endpoint = `/api/products`;
        method = 'DELETE';
      }
      
      console.log(`Deleting product with ID: "${productToDelete}" using endpoint: ${endpoint}`);
      
      const res = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: productToDelete })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error deleting product');
      }
      
      setSuccess('Product deleted successfully!');
      fetchProducts(); // Refresh product list
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleNewProduct = () => {
    // Start with empty product - ID will be set when saving
    setCurrentProduct(emptyProduct);
    setIsEditing(false);
    setError('');
    setSuccess('');
    setImagePreview('');
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    router.push('/admin');
  };

  return (
    <>
      <Head>
        <title>Product Management | Admin | Cakelandia</title>
      </Head>
      <div className={styles.adminContainer}>
        <header className={styles.adminHeader}>
          <h1>Admin Dashboard</h1>
          <div className={styles.headerButtons}>
            <button 
              onClick={handleLogout} 
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </header>
        
        <AdminNavigation />
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <div className={styles.adminContent}>
          <section className={styles.productForm} id="productForm">
            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentProduct.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  value={currentProduct.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={currentProduct.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="imageUpload">Product Image</label>
                <input
                  type="file"
                  id="imageUpload"
                  name="imageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Product preview" />
                  </div>
                )}
                {isEditing && !uploadedImage && (
                  <p className={styles.uploadNote}>
                    {currentProduct.image ? 'Leave empty to keep current image' : 'Upload an image for this product'}
                  </p>
                )}
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="stock">Stock Quantity</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={currentProduct.stock || 0}
                    onChange={handleInputChange}
                    required
                  />
                  <p className={styles.fieldHelp}>Number of items available for purchase</p>
                </div>
              
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={currentProduct.featured || false}
                      onChange={handleInputChange}
                    />
                    <span>Featured Product</span>
                  </label>
                  <p className={styles.fieldHelp}>Featured products are shown on the homepage</p>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={currentProduct.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formButtons}>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={isSaving || isUploading}
                >
                  {isSaving || isUploading ? 
                    (isUploading ? 'Uploading Image...' : 'Saving...') : 
                    (isEditing ? 'Update Product' : 'Add Product')}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={handleNewProduct}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
          
          {/* Product List */}
          <section className={styles.productList}>
            <h2>Products</h2>
            {isLoading ? (
              <p>Loading products...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : products.length === 0 ? (
              <p>No products found. Add your first product!</p>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
                      // Ensure we have a valid key by combining id and index
                      const productKey = `product-row-${product.id || ''}-${index}`;
                      
                      return (
                      <tr key={productKey} className={product.stock === 0 ? styles.outOfStock : (product.stock || 0) <= 5 ? styles.lowStock : ''}>
                        <td>
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className={styles.thumbnail} 
                            />
                          ) : (
                            <div className={styles.noImage}>No Image</div>
                          )}
                        </td>
                        <td>
                          {product.name}
                          {product.featured && <span className={styles.featuredBadge}>Featured</span>}
                        </td>
                        <td>${product.price.toFixed(2)}</td>
                        <td className={styles.stockColumn}>
                          <span className={`${styles.stockBadge} ${
                            product.stock === 0 ? styles.outOfStockBadge : 
                            (product.stock || 0) <= 5 ? styles.lowStockBadge : 
                            styles.inStockBadge
                          }`}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td>
                          {product.stock === 0 ? (
                            <span className={styles.statusBadge + ' ' + styles.outOfStockStatus}>Out of Stock</span>
                          ) : (product.stock || 0) <= 5 ? (
                            <span className={styles.statusBadge + ' ' + styles.lowStockStatus}>Low Stock</span>
                          ) : (
                            <span className={styles.statusBadge + ' ' + styles.inStockStatus}>In Stock</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className={styles.editButton} 
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteButton} 
                            onClick={() => {
                              // For products with empty IDs, offer a direct delete option
                              if (product.id === '') {
                                if (confirm(`This product (${product.name}) has an empty ID. Delete directly?`)) {
                                  // Direct deletion for empty ID products
                                  fetch('/api/products/empty-id', { method: 'DELETE' })
                                    .then(res => res.json())
                                    .then(data => {
                                      setSuccess(`Deleted ${data.deletedCount} products with empty IDs`);
                                      fetchProducts();
                                    })
                                    .catch(err => setError('Failed to delete: ' + err.message));
                                }
                              } else {
                                openDeleteModal(product.id, product.name);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
                
                {/* Pagination Component */}
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              </>
            )}
          </section>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
