import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from './Admin.module.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // In a real application, this should be an environment variable
  // and the authentication should be handled securely on the server
  const ADMIN_PASSWORD = 'cakelandia2025';

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      // Set session storage to keep admin logged in for this session
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      router.push('/admin/products');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | Cakelandia</title>
      </Head>
      <div className={styles.adminLogin}>
        <div className={styles.loginCard}>
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
