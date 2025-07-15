/**
 * Authentication utility functions for Cakelandia admin panel
 */

/**
 * Checks if the current user has an active admin session
 * Currently uses sessionStorage for simplicity, but should be replaced with
 * a proper authentication system in production
 */
export const checkAdminSession = async (): Promise<boolean> => {
  // Check for admin session in sessionStorage
  // In a real app, this would verify a JWT token or session cookie with the server
  if (typeof window !== 'undefined') {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    return isLoggedIn;
  }
  
  return false;
};

/**
 * Sets the admin session after successful login
 */
export const setAdminSession = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('isAdminLoggedIn', 'true');
  }
};

/**
 * Clears the admin session on logout
 */
export const clearAdminSession = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('isAdminLoggedIn');
  }
};
