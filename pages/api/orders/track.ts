import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Order } from '@/types/order';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { trackingNumber, email } = req.query;
  
  if (!trackingNumber || Array.isArray(trackingNumber)) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    if (!fs.existsSync(ordersFilePath)) {
      return res.status(404).json({ error: 'No orders found' });
    }
    
    const data = fs.readFileSync(ordersFilePath, 'utf8');
    const orders: Order[] = data ? JSON.parse(data) : [];
    
    // Find order by tracking number
    let order = orders.find(o => o.trackingNumber === trackingNumber);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // If email is provided, verify it matches the order
    if (email && !Array.isArray(email) && email !== order.customerEmail) {
      return res.status(403).json({ error: 'Email does not match order' });
    }
    
    // Return limited information for public tracking
    const trackingInfo = {
      trackingNumber: order.trackingNumber,
      status: order.status,
      customerName: order.customerName.split(' ')[0], // Just the first name for privacy
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    return res.status(200).json(trackingInfo);
  } catch (error) {
    console.error('Error tracking order:', error);
    return res.status(500).json({ error: 'Failed to track order' });
  }
}
