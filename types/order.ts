import { Product } from './product';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  notes?: string;
}
