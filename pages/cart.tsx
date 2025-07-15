import React, { useState, FormEvent, MouseEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '@/context/CartContext';
import styles from './Cart.module.css';

export default function Cart() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [cityError, setCityError] = useState('');
  const [postalError, setPostalError] = useState('');

  // Phone number for WhatsApp Business - replace with your actual business number
  const whatsappNumber = '256759729085'; // Change this number to your desired WhatsApp business number (with country code, no + symbol)

  // Format the displayed phone number for better readability
  const formatPhoneNumber = (phone: string) => {
    // Basic phone formatting - can be customized per country requirements
    if (phone.length < 8) return phone;

    // Just a simple format with spaces for readability
    return phone.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Enhanced validation - at least 8 digits, allow spaces, parentheses, dashes for input
    // but strip them for validation
    const cleanPhone = phone.replace(/[\s()\-+]/g, '');
    const phoneRegex = /^[0-9]{8,}$/;
    return phoneRegex.test(cleanPhone);
  };

  const validatePostalCode = (postalCode: string): boolean => {
    // Basic postal/zip code validation - adjust for your country format
    const postalRegex = /^[a-zA-Z0-9]{3,10}$/;
    return postalRegex.test(postalCode.replace(/\s/g, ''));
  };

  const validateForm = () => {
    let isValid = true;

    // Name validation
    if (!customerName) {
      setNameError('Please enter your name');
      isValid = false;
    } else {
      setNameError('');
    }

    // Email validation
    if (!customerEmail) {
      setEmailError('Please enter your email');
      isValid = false;
    } else if (!validateEmail(customerEmail)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Phone validation (optional but must be valid if provided)
    if (customerPhone && !validatePhone(customerPhone)) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    // Address validation
    if (!address) {
      setAddressError('Please enter your delivery address');
      isValid = false;
    } else {
      setAddressError('');
    }

    // City validation
    if (!city) {
      setCityError('Please enter your city');
      isValid = false;
    } else {
      setCityError('');
    }

    // Postal code validation
    if (!postalCode) {
      setPostalError('Please enter your postal/zip code');
      isValid = false;
    } else if (!validatePostalCode(postalCode)) {
      setPostalError('Please enter a valid postal/zip code');
      isValid = false;
    } else {
      setPostalError('');
    }

    return isValid;
  };

  // Input change handlers with validation
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);
    if (!e.target.value) {
      setNameError('Please enter your name');
    } else {
      setNameError('');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomerEmail(e.target.value);
    if (!e.target.value) {
      setEmailError('Please enter your email');
    } else if (!validateEmail(e.target.value)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomerPhone(e.target.value);
    if (e.target.value && !validatePhone(e.target.value)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (!e.target.value) {
      setAddressError('Please enter your delivery address');
    } else {
      setAddressError('');
    }
  };

  const handleCityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    if (!e.target.value) {
      setCityError('Please enter your city');
    } else {
      setCityError('');
    }
  };

  const handlePostalCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostalCode(e.target.value);
    if (!e.target.value) {
      setPostalError('Please enter your postal/zip code');
    } else if (!validatePostalCode(e.target.value)) {
      setPostalError('Please enter a valid postal/zip code');
    } else {
      setPostalError('');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const generateWhatsAppLink = () => {
    // Check for inventory availability first
    const stockIssues = cartItems.filter(item => 
      item.stock !== undefined && item.quantity > item.stock
    );

    if (stockIssues.length > 0) {
      return '#inventory-error';
    }

    let message = `*New Order from Cakelandia*\n\n`;
    message += `Customer: ${customerName}\n`;
    message += `Phone: ${customerPhone}\n`;
    message += `Email: ${customerEmail}\n`;
    message += `Address: ${address}, ${city}, ${postalCode}\n\n`;
    message += `*Items:*\n`;

    cartItems.forEach(item => {
      message += `- ${item.name}: $${item.price.toFixed(2)} x ${item.quantity || 1}\n`;
    });

    message += `\nTotal: $${calculateTotal().toFixed(2)}\n\n`;
    if (notes) {
      message += `Notes: ${notes}\n`;
    }

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    // Return the WhatsApp link
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  };

  // Handle WhatsApp order and redirect to confirmation
  const handleWhatsAppOrder = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!customerName || !customerEmail || !customerPhone || !address || !city || !postalCode) {
      e.preventDefault();
      alert('Please fill in all required fields first');
      return;
    }
    
    // Validate form data
    if (!validateForm()) {
      e.preventDefault();
      return;
    }

    // Check for inventory limits
    const stockIssues = cartItems.filter(item => 
      item.stock !== undefined && item.quantity > item.stock
    );

    if (stockIssues.length > 0) {
      e.preventDefault();
      const items = stockIssues.map(item => `${item.name} (available: ${item.stock})`).join(', ');
      alert(`Some items exceed available inventory: ${items}`);
      return;
    }

    // Store confirmation info in session for redirect after WhatsApp
    sessionStorage.setItem('orderConfirmation', JSON.stringify({
      name: customerName,
      email: customerEmail,
      phone: formatPhoneNumber(customerPhone),
      address: address,
      city: city,
      postalCode: postalCode,
      method: 'WhatsApp',
      timestamp: Date.now()
    }));

    // WhatsApp link will open in new tab, we'll redirect on return
    setTimeout(() => {
      router.push({
        pathname: '/confirmation',
        query: {
          name: customerName,
          email: customerEmail,
          phone: formatPhoneNumber(customerPhone),
          address: address,
          city: city,
          postalCode: postalCode,
          method: 'WhatsApp',
          timestamp: Date.now()
        }
      });
    }, 100);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${address}, ${city}, ${postalCode}`;
      
      // Create order data object
      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        address: fullAddress,
        items: cartItems.map(item => ({
          product: item,
          quantity: item.quantity
        })),
        total: calculateTotal(),
        notes
      };
      
      // Submit order to backend API
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderData })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit order');
      }
      
      // Clear cart on successful order
      clearCart();
      
      setIsSubmitting(false);
      setOrderSuccess(true);

      // Redirect to confirmation page with order details and tracking number
      router.push({
        pathname: '/confirmation',
        query: {
          name: customerName,
          email: customerEmail,
          phone: formatPhoneNumber(customerPhone),
          address: fullAddress,
          method: 'email',
          timestamp: Date.now(), // Add timestamp to prevent caching issues
          orderId: result.orderId,
          trackingNumber: result.trackingNumber
        }
      });
    } catch (error) {
      console.error('Order submission failed:', error);
      setIsSubmitting(false);
      alert('Sorry, there was a problem submitting your order. Please try again.');
    }
  };

  if (orderSuccess) {
    return (
      <div className={styles.cart}>
        <h1>Order Submitted!</h1>
        <p>Thank you for your order. We will contact you shortly!</p>
        <div className={styles.whatsappSuccess}>
          <p>Prefer to chat about your order?</p>
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            <span>Continue on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage} key="cart-page-container">
      <Head>
        <title>Shopping Cart - Cakelandia</title>
        <meta name="description" content="Review your order and proceed to checkout" />
      </Head>
      <div className={styles.cart}>
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className={styles.cartContent} key="cart-content-container">
            <ul className={styles.itemsList}>
              {cartItems.map(item => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className={styles.noImage}>No Image</div>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                    <p className={styles.itemCategory}>{item.category}</p>
                  </div>
                  <div className={styles.itemQuantity}>
                    <button 
                      className={styles.quantityButton}
                      onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      className={styles.quantityButton}
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.itemSubtotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    className={styles.removeButton} 
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.cartSummary}>
              <h3>Total: ${calculateTotal().toFixed(2)}</h3>
            </div>

            <div className={styles.orderForm}>
              {/* Customer information form */}
              <form className={styles.orderForm} onSubmit={handleSubmit}>
                <h2>Customer Information</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="customerName">Full Name:</label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={nameError ? styles.inputError : ''}
                    required
                    placeholder="Your full name"
                  />
                  {nameError && <span className={styles.errorMessage}>{nameError}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="customerEmail">Email Address:</label>
                  <input
                    type="email"
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={emailError ? styles.inputError : ''}
                    required
                    placeholder="your.email@example.com"
                  />
                  {emailError && <span className={styles.errorMessage}>{emailError}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="customerPhone">Phone Number:</label>
                  <input
                    type="tel"
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={phoneError ? styles.inputError : ''}
                    placeholder="For delivery coordination"
                    required
                  />
                  {phoneError && <span className={styles.errorMessage}>{phoneError}</span>}
                </div>

                <h3 className={styles.sectionTitle}>Delivery Address</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="address">Street Address:</label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={addressError ? styles.inputError : ''}
                    required
                    placeholder="Street address, apartment, suite, etc."
                  />
                  {addressError && <span className={styles.errorMessage}>{addressError}</span>}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="city">City:</label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={cityError ? styles.inputError : ''}
                      required
                      placeholder="Your city"
                    />
                    {cityError && <span className={styles.errorMessage}>{cityError}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="postalCode">Postal/Zip Code:</label>
                    <input
                      type="text"
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className={postalError ? styles.inputError : ''}
                      required
                      placeholder="Postal code"
                    />
                    {postalError && <span className={styles.errorMessage}>{postalError}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="notes">Order Notes (optional):</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Special requests, delivery instructions, etc."
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    className={styles.orderButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Place Order via Email'}
                  </button>

                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappButton}
                    onClick={handleWhatsAppOrder}
                  >
                    <span>Order via WhatsApp</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
      )}
    </div>
    </div>
  );
}
