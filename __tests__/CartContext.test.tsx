import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { Product } from '../types/product';

describe('CartContext', () => {
  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    const product: Product = { id: '1', name: 'Test', description: 'Desc', price: 10, image: '', category: 'Test' };
    act(() => {
      result.current.addToCart(product);
    });
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].id).toBe('1');
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    const product: Product = { id: '1', name: 'Test', description: 'Desc', price: 10, image: '', category: 'Test' };
    act(() => {
      result.current.addToCart(product);
    });
    act(() => {
      result.current.removeFromCart('1');
    });
    expect(result.current.cartItems).toHaveLength(0);
  });
});
