import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Admin.module.css';

const AdminNavigation = () => {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear session storage
    sessionStorage.removeItem('isAdminLoggedIn');
    
    // Call logout API to clear HTTP-only cookie
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Redirect to login page
    router.push('/admin/login');
  };

  return (
    <nav className={styles.adminNav}>
      <div className={styles.adminNavLinks}>
        <Link href="/admin/dashboard">
          <span className={router.pathname === '/admin/dashboard' ? styles.activeLink : ''}>
            Dashboard
          </span>
        </Link>
        <Link href="/admin/products">
          <span className={router.pathname === '/admin/products' ? styles.activeLink : ''}>
            Products
          </span>
        </Link>
        <Link href="/admin/orders">
          <span className={router.pathname === '/admin/orders' ? styles.activeLink : ''}>
            Orders
          </span>
        </Link>
      </div>
      <div className={styles.adminActions}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavigation;
