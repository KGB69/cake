import React, { useState } from 'react';
import Head from 'next/head';
import styles from './Tracking.module.css';

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [email, setEmail] = useState('');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('trackingNumber', trackingNumber);
      if (email) queryParams.append('email', email);
      
      const res = await fetch(`/api/orders/track?${queryParams.toString()}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to track order');
      }
      
      const data = await res.json();
      setOrderInfo(data);
    } catch (err) {
      console.error('Tracking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to track your order');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Order Received', color: 'blue' };
      case 'processing':
        return { text: 'Processing', color: 'orange' };
      case 'shipped':
        return { text: 'Shipped', color: 'purple' };
      case 'delivered':
        return { text: 'Delivered', color: 'green' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'red' };
      default:
        return { text: 'Unknown', color: 'grey' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.trackingPage} key="tracking-page-container">
      <Head>
        <title>Track Your Order | Cakelandia</title>
      </Head>
      
      <div className={styles.trackingPage}>
        <h1 className={styles.title}>Track Your Order</h1>
        
        <div className={styles.trackingContainer}>
          <form onSubmit={handleSubmit} className={styles.trackingForm}>
            <div className={styles.formGroup}>
              <label htmlFor="trackingNumber">Tracking Number</label>
              <input 
                id="trackingNumber"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter your tracking number"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email (optional for verification)</label>
              <input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email used for the order"
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.trackButton}
              disabled={loading}
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
            
            {error && <p className={styles.error}>{error}</p>}
          </form>
          
          {orderInfo && (
            <div className={styles.orderInfo}>
              <h2>Order Information</h2>
              <div className={styles.orderDetails}>
                <p><strong>Tracking Number:</strong> {orderInfo.trackingNumber}</p>
                <p><strong>Customer Name:</strong> {orderInfo.customerName}</p>
                <p><strong>Order Date:</strong> {formatDate(orderInfo.createdAt)}</p>
                <p><strong>Last Updated:</strong> {formatDate(orderInfo.updatedAt)}</p>
                
                <div className={styles.statusContainer}>
                  <p><strong>Status:</strong></p>
                  <span 
                    className={styles.statusBadge} 
                    style={{ backgroundColor: getStatusDisplay(orderInfo.status).color }}
                  >
                    {getStatusDisplay(orderInfo.status).text}
                  </span>
                </div>
                
                <div className={styles.statusTimeline}>
                  <div className={`${styles.statusStep} ${['pending', 'processing', 'shipped', 'delivered'].includes(orderInfo.status) ? styles.completed : ''}`}>
                    <div className={styles.statusDot}></div>
                    <p>Order Received</p>
                  </div>
                  <div className={`${styles.statusStep} ${['processing', 'shipped', 'delivered'].includes(orderInfo.status) ? styles.completed : ''}`}>
                    <div className={styles.statusDot}></div>
                    <p>Processing</p>
                  </div>
                  <div className={`${styles.statusStep} ${['shipped', 'delivered'].includes(orderInfo.status) ? styles.completed : ''}`}>
                    <div className={styles.statusDot}></div>
                    <p>Shipped</p>
                  </div>
                  <div className={`${styles.statusStep} ${['delivered'].includes(orderInfo.status) ? styles.completed : ''}`}>
                    <div className={styles.statusDot}></div>
                    <p>Delivered</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
