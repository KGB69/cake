import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard/ProductCard';
import { Product } from '@/types/product';
import { HomepageContent } from '@/types/homepage';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentRefreshKey, setContentRefreshKey] = useState(Date.now()); // Key for forcing refresh

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const featuredRes = await fetch('/api/products?featured=true&limit=4'); 
        const featuredData = await featuredRes.json();
        setFeaturedProducts(featuredData.products || []);
        setCategories(featuredData.categories || []);
        
        // Fetch popular products (just getting a different set for now)
        const popularRes = await fetch('/api/products?limit=8'); 
        const popularData = await popularRes.json();
        setPopularProducts(popularData.products || []);
        
        // Fetch homepage content with cache-busting parameter
        const timestamp = new Date().getTime();
        const homepageRes = await fetch(`/api/homepage?t=${timestamp}`);
        const homepageData = await homepageRes.json();
        
        if (homepageData.content) {
          setHomepageContent(homepageData.content);
        } else {
          console.error('No homepage content received');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh content every 30 seconds to check for updates
    const intervalId = setInterval(() => {
      setContentRefreshKey(Date.now());
      fetchData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [contentRefreshKey]);

  return (
    <div className={styles.homePage} key="home-page-container">
      <Head>
        <title>Cakelandia - Delicious Pastries and Cakes</title>
        <meta name="description" content="Discover our selection of delicious pastries, cakes, and baked goods. Made fresh with the finest ingredients." />
      </Head>
      
      <section 
        className={styles.hero} 
        style={{
          backgroundImage: homepageContent?.heroImage ? 
            `url(${homepageContent.heroImage})` : 
            'url(/images/hero-default.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className={styles.heroContent}>
          <h1>{homepageContent?.heroTitle || 'Welcome to Cakelandia'}</h1>
          <p>{homepageContent?.heroSubtitle || 'Delicious pastries for every occasion'}</p>
          <Link href="/shop" passHref legacyBehavior>
            <a className={styles.heroButton}>
              {homepageContent?.heroButtonText || 'Shop Now'}
            </a>
          </Link>
        </div>
      </section>
      
      {/* Featured Products Showcase */}
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.highlight}>Featured</span> Pastries
          </h2>
          {loading ? (
            <div className={styles.loadingContainer}>
              <p>Loading featured products...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className={styles.noProducts}>No featured products available. Check back soon!</p>
          ) : (
            <div className={styles.featuredGrid}>
              {featuredProducts.map((product, index) => (
                <div key={`featured-${product.id || index}`} className={styles.featuredCard}>
                  <div className={styles.featuredBadge}>Featured</div>
                  <ProductCard key={`featured-card-${product.id || index}`} product={product} />
                </div>
              ))}
            </div>
          )}
          <div className={styles.viewAllContainer}>
            <Link href="/shop" passHref legacyBehavior>
              <a className={styles.viewAllButton}>View All Products</a>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Browse by Category */}
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Shop by <span className={styles.highlight}>Category</span>
          </h2>
          
          {categories.length > 0 ? (
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <div key={category}>
                  <Link 
                    href={`/shop?category=${category}`}
                    passHref
                    legacyBehavior
                  >
                    <a className={styles.categoryCard}>
                      <div className={styles.categoryName}>
                        {category}
                      </div>
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noProducts}>Categories loading...</p>
          )}
        </div>
      </section>
      
      {/* Popular Products */}
      <section className={styles.popularSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Popular <span className={styles.highlight}>Choices</span>
          </h2>
          {popularProducts.length > 0 ? (
            <div className={styles.productsGrid}>
              {popularProducts.slice(0, 4).map((product, index) => (
                <div key={`popular-${product.id || index}`}>
                  <ProductCard key={`popular-card-${product.id || index}`} product={product} />
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noProducts}>Loading popular products...</p>
          )}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2>Ready to Order Your Perfect Pastry?</h2>
          <p>Contact us for custom orders, special events, and catering options</p>
          <div className={styles.ctaButtons}>
            <Link href="/shop" passHref legacyBehavior>
              <a className={styles.primaryButton}>Shop Now</a>
            </Link>
            <Link href="/cart" passHref legacyBehavior>
              <a className={styles.secondaryButton}>View Cart</a>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
