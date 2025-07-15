export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean; // Flag for featured products on homepage
  stock?: number; // Inventory tracking
}
