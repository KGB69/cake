import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Confirmation.module.css';
import { useCart } from '@/context/CartContext';

export default function Confirmation() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  
  // Get order details from router query params
  const { name, email, phone, method, address, trackingNumber, orderId } = router.query;
  
  useEffect(() => {
    // If navigated directly without params, redirect to shop
    if (!method && !router.query.name && router.isReady) {
      router.push('/shop');
    }
    
    // Clear cart after confirmation display
    const timer = setTimeout(() => {
      clearCart();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router, clearCart, method]);
  
  // Use provided order number/tracking number or generate a fallback
  const orderNumber = trackingNumber || orderId || `${Date.now().toString().slice(-6)}-${name?.toString().slice(0, 2).toUpperCase() || 'CK'}`;
  
  return (
    <div className={styles.confirmationPage} key="confirmation-page-container">
      <Head>
        <title>Order Confirmation - Cakelandia</title>
      </Head>
      <div className={styles.confirmationContainer}>
        <div className={styles.confirmationCard}>
          <div className={styles.checkmarkContainer}>
            <div className={styles.checkmark}></div>
          </div>
          
          <h1>Thank You!</h1>
          <p className={styles.orderConfirmed}>Your order has been confirmed</p>
          
          {method && (
            <p className={styles.methodInfo}>
              Your order details have been sent via <span>{method}</span>
            </p>
          )}
          
          <div className={styles.orderDetails}>
            <div className={styles.orderInfo}>
              <span>Order Number:</span>
              <strong>{orderNumber}</strong>
            </div>
            
            {name && (
              <div className={styles.customerInfo}>
                <h3>Customer Information:</h3>
                <p><strong>Name:</strong> {name}</p>
                {email && <p><strong>Email:</strong> {email}</p>}
                {phone && <p><strong>Phone:</strong> {phone}</p>}
                {address && <p><strong>Delivery Address:</strong> {address}</p>}
              </div>
            )}
            
            {trackingNumber && (
              <div className={styles.trackingInfo}>
                <h3>Tracking Information:</h3>
                <p><strong>Tracking Number:</strong> {trackingNumber}</p>
                <p className={styles.trackingNote}>You can use this tracking number to check your order status.</p>
              </div>
            )}
          </div>
          
          <p className={styles.followupInfo}>
            We'll contact you shortly to confirm your order and delivery details.
          </p>
          
          <div className={styles.actionButtons}>
            <Link href="/shop" className={styles.continueShoppingBtn}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
