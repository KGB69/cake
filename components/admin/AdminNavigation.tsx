import React from 'react';
import Link from 'next/link';
import styles from '@/styles/AdminNav.module.css';

interface AdminNavigationProps {
  activePage: 'dashboard' | 'orders' | 'products' | 'homepage';
}

export default function AdminNavigation({ activePage }: AdminNavigationProps) {
  return (
    <div className={styles.adminNavigation}>
      <div className={styles.logo}>
        <Link href="/">Cakelandia</Link>
        <span className={styles.adminBadge}>Admin</span>
      </div>
      
      <nav>
        <ul className={styles.navList}>
          <li>
            <Link 
              href="/admin/dashboard" 
              className={activePage === 'dashboard' ? styles.active : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              href="/admin/orders" 
              className={activePage === 'orders' ? styles.active : ''}
            >
              Orders
            </Link>
          </li>
          <li>
            <Link 
              href="/admin/products" 
              className={activePage === 'products' ? styles.active : ''}
            >
              Products
            </Link>
          </li>
          <li>
            <Link 
              href="/admin/homepage" 
              className={activePage === 'homepage' ? styles.active : ''}
            >
              Homepage
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
