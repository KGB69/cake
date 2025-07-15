import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard/ProductCard';
import styles from './Products.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = ['all', 'Breakfast', 'Dessert'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=100'); // Get a large number of products
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // First filter by category, then by search term
  const filteredProducts = products.length > 0 ? 
    (selectedCategory === 'all' ? 
      products : 
      products.filter(p => p.category === selectedCategory)
    ).filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

  return (
    <div>
      <div className={styles.container}>
        <h1 className={styles.title}>Our Pastries</h1>
        <div className={styles.filterContainer}>
          <label htmlFor="category">Filter by category: </label>
          <select id="category" onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className={styles.searchContainer}>
          <label htmlFor="search">Search: </label>
          <input type="text" id="search" onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} placeholder="Search by name or description" />
        </div>
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
