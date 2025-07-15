import React from 'react';
import styles from './ProductCard.module.css';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  return (
    <div className={styles.card}>
      <img
        src={product.image}
        alt={product.name}
        className={styles.image}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          const target = e.currentTarget;
          if (!target.src.includes('fallback-image.jpg')) {
            target.src = '/fallback-image.jpg';
          }
        }}
      />
      <div className={styles.details}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <button className={styles.button} onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );
}
