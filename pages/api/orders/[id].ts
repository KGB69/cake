import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Order, OrderStatus } from '@/types/order';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  
  try {
    // Read orders file
    if (!fs.existsSync(ordersFilePath)) {
      return res.status(404).json({ error: 'No orders found' });
    }
    
    const data = fs.readFileSync(ordersFilePath, 'utf8');
    let orders: Order[] = data ? JSON.parse(data) : [];
    
    // GET - Retrieve a specific order
    if (req.method === 'GET') {
      const order = orders.find(order => order.id === id || order.trackingNumber === id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      return res.status(200).json(order);
    }
    
    // PUT - Update order status (admin only)
    else if (req.method === 'PUT') {
      const orderIndex = orders.findIndex(order => order.id === id);
      
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const { status } = req.body;
      
      // Validate status
      if (status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      // Update order
      orders[orderIndex] = {
        ...orders[orderIndex],
        ...(status && { status: status as OrderStatus }),
        updatedAt: new Date().toISOString()
      };
      
      // Save updated orders
      fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
      
      return res.status(200).json(orders[orderIndex]);
    } 
    
    else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling order request:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
