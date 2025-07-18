import { createContext, useState, ReactNode, useContext } from 'react';
import { Product } from '@/types/product';

type CartItem = Product & { quantity: number };

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    if (!productId) {
      console.error('Attempted to remove item with invalid ID:', productId);
      return;
    }
    
    setCartItems((prevItems) => {
      // Log before removal for debugging
      if (prevItems.length > 0 && !prevItems.some(item => item.id === productId)) {
        console.warn('Item not found in cart with ID:', productId);
        console.debug('Current cart items:', prevItems);
      }
      
      return prevItems.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (!productId) {
      console.error('Attempted to update item with invalid ID:', productId);
      return;
    }
    
    setCartItems((prevItems) => {
      // Check if the item exists before updating
      const itemExists = prevItems.some(item => item.id === productId);
      if (!itemExists) {
        console.warn('Item not found in cart for quantity update with ID:', productId);
        return prevItems;
      }
      
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: quantity } : item
      );
    });
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
