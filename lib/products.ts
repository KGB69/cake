import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  { id: '1', name: 'Croissant', description: 'Buttery and flaky', price: 2.50, image: '/images/croissant.jpg', category: 'Breakfast' },
  { id: '2', name: 'Eclair', description: 'Chocolate filled pastry', price: 3.00, image: '/images/eclair.jpg', category: 'Dessert' },
  { id: '3', name: 'Macaron', description: 'Colorful and sweet', price: 1.50, image: '/images/macaron.jpg', category: 'Dessert' },
  { id: '4', name: 'Bagel', description: 'Chewy bread ring', price: 1.00, image: '/images/bagel.jpg', category: 'Breakfast' },
];
