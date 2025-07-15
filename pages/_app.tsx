import React from 'react';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { CartProvider } from '@/context/CartContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <NavBar key="navbar" />
      <main key="main-content">{Component ? <Component {...pageProps} /> : null}</main>
      <Footer key="footer" />
    </CartProvider>
  );
}
