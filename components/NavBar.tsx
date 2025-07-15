import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './NavBar.module.css';

export default function NavBar() {
  const router = useRouter();
  const currentPath = router.pathname;
  
  // Simple direct links - no mapping to avoid key issues
  return (
    <nav className={styles.nav}>
      <div className={styles.navItem}>
        <Link href="/" className={currentPath === '/' ? styles.active : ''}>
          Home
        </Link>
      </div>
      
      <div className={styles.navItem}>
        <Link href="/shop" className={currentPath === '/shop' ? styles.active : ''}>
          Shop
        </Link>
      </div>
      
      <div className={styles.navItem}>
        <Link href="/cart" className={currentPath === '/cart' ? styles.active : ''}>
          Cart
        </Link>
      </div>
    </nav>
  );
}
