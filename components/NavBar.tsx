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
        <Link href="/" passHref legacyBehavior>
          <a className={currentPath === '/' ? styles.active : ''}>Home</a>
        </Link>
      </div>
      
      <div className={styles.navItem}>
        <Link href="/shop" passHref legacyBehavior>
          <a className={currentPath === '/shop' ? styles.active : ''}>Shop</a>
        </Link>
      </div>
      
      <div className={styles.navItem}>
        <Link href="/cart" passHref legacyBehavior>
          <a className={currentPath === '/cart' ? styles.active : ''}>Cart</a>
        </Link>
      </div>
    </nav>
  );
}
