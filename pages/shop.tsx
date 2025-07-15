import React, { useState, useEffect, ChangeEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProductCard from '@/components/ProductCard/ProductCard';
import { Product } from '@/types/product';
import styles from '@/styles/Shop.module.css';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';

export default function Shop() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const productsPerPage = 9;

  // Set initial category from query parameter if available
  useEffect(() => {
    const { category } = router.query;
    if (category && typeof category === 'string') {
      setSelectedCategory(category);
    }
  }, [router.query]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products?limit=100'); // Get all products or a large number
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(data.products.map((product: Product) => product.category))
          );
          setCategories(uniqueCategories as string[]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products when category or search term changes
  useEffect(() => {
    let result = products;
    
    // Apply category filter if not 'all'
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCategory, searchTerm, products]);

  // Handle category change
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement> | string) => {
    const category = typeof e === 'string' ? e : e.target.value;
    setSelectedCategory(category);
    
    // Update URL with the category parameter
    if (category !== 'all') {
      router.push({
        pathname: '/shop',
        query: { ...router.query, category }
      }, undefined, { shallow: true });
    } else {
      // Remove category from URL if 'all' is selected
      const { category, ...restQuery } = router.query;
      router.push({
        pathname: '/shop',
        query: restQuery
      }, undefined, { shallow: true });
    }
  };
  
  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };
  
  // Toggle view mode between grid and list
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={styles.shopPage} key="shop-page-container">
      <Head>
        <title>Shop - Cakelandia</title>
        <meta name="description" content="Browse our delicious pastries and cakes" />
      </Head>
      
      <div className={styles.shopContainer}>
        <header className={styles.shopHeader}>
          <h1 className={styles.pageTitle}>Our Delicious Products</h1>
          <p className={styles.pageSubtitle}>Browse our selection of freshly baked pastries and cakes</p>
        </header>
        
        <div className={styles.shopControls}>
          <div className={styles.mobileFilterToggle}>
            <button onClick={toggleMobileFilters} className={styles.filterButton}>
              <FiFilter /> Filters
            </button>
            <button onClick={toggleViewMode} className={styles.viewModeButton}>
              {viewMode === 'grid' ? <FiList /> : <FiGrid />}
            </button>
          </div>
          
          <div className={`${styles.filterContainer} ${showMobileFilters ? styles.showMobileFilters : ''}`}>
            <div className={styles.searchBox}>
              <div className={styles.searchInputWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
              </div>
            </div>
            
            <div className={styles.categoryFilter}>
              <label htmlFor="category">Category:</label>
              <select 
                id="category" 
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e)}
                className={styles.categorySelect}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {!loading && (
            <div className={styles.categoryChips}>
              <button 
                className={`${styles.categoryChip} ${selectedCategory === 'all' ? styles.activeChip : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={`${styles.categoryChip} ${selectedCategory === category ? styles.activeChip : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Loading delicious products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.noResults}>
            <p>No products found matching your criteria.</p>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className={styles.resetButton}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <div className={styles.resultsInfo}>
              Showing {currentProducts.length} of {filteredProducts.length} products
            </div>
            
            <div className={viewMode === 'grid' ? styles.productsGrid : styles.productsList}>
              {currentProducts.map((product, index) => (
                <div key={`product-wrapper-${product.id || index}`}>
                  <ProductCard key={`product-card-${product.id || index}`} product={product} />
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className={styles.paginationWrapper} key="pagination-wrapper">
                <span>Page {currentPage} of {totalPages}</span>
                <div className={styles.paginationContainer}>
                  <button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                  >
                    Previous
                  </button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(totalPages, 5) })
                      .map((_, index) => {
                        // Logic to show pages around current page
                        let pageNum = currentPage <= 3 ? index + 1 : currentPage - 3 + index + 1;
                        if (pageNum > totalPages) return null;
                        return { pageNum, index };
                      })
                      // Filter out null values before rendering
                      .filter(item => item !== null)
                      .map(item => {
                        if (!item) return null; // TypeScript safety
                        return (
                          <button 
                            key={`page-${item.pageNum}-${item.index}`}
                            onClick={() => paginate(item.pageNum)}
                            className={`${styles.pageNumberButton} ${currentPage === item.pageNum ? styles.activePage : ''}`}
                          >
                            {item.pageNum}
                          </button>
                        );
                      })
                    }
                  </div>
                  
                  <button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
