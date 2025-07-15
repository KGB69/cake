import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './Footer.module.css';

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const router = useRouter();

  // Reset click count after 5 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 5000); // Reset after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleSecretClick = () => {
    const now = Date.now();
    
    // If it's been more than 5 seconds since last click, reset count
    if (now - lastClickTime > 5000 && clickCount > 0) {
      setClickCount(1); // Reset to 1 (this current click)
    } else {
      setClickCount(clickCount + 1);
    }
    
    setLastClickTime(now);

    // After 3 clicks, redirect to admin panel
    if (clickCount === 2) { // This is the 3rd click (0->1->2->3)
      router.push('/admin/login');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>&copy; 2025 Cakelandia. All rights reserved.</p>
        <span 
          className={styles.adminLink} 
          onClick={handleSecretClick}
          title={clickCount > 0 ? `${3 - clickCount} more clicks needed` : ''}
        >
          ---
        </span>
      </div>
    </footer>
  );
}
