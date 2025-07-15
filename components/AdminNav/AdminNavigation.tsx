import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../pages/admin/Admin.module.css';

export default function AdminNavigation() {
  const router = useRouter();
  
  const isActive = (path: string) => {
    return router.pathname === path;
  };
  
  return (
    <nav className={styles.adminNav}>
      <ul className={styles.adminNavList}>
        <li className={styles.adminNavItem}>
          <Link 
            href="/admin/products" 
            className={`${styles.adminNavLink} ${isActive('/admin/products') ? styles.adminNavLinkActive : ''}`}
          >
            Products
          </Link>
        </li>
        <li className={styles.adminNavItem}>
          <Link 
            href="/admin/orders" 
            className={`${styles.adminNavLink} ${isActive('/admin/orders') ? styles.adminNavLinkActive : ''}`}
          >
            Orders
          </Link>
        </li>
        <li className={styles.adminNavItem}>
          <Link 
            href="/admin/homepage" 
            className={`${styles.adminNavLink} ${isActive('/admin/homepage') ? styles.adminNavLinkActive : ''}`}
          >
            Homepage Content
          </Link>
        </li>
      </ul>
    </nav>
  );
}
