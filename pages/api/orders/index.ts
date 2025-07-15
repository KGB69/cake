import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Order } from '@/types/order';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET all orders (for admin) with pagination
  if (req.method === 'GET') {
    try {
      // Read all orders
      let orders: Order[] = [];
      if (fs.existsSync(ordersFilePath)) {
        const data = fs.readFileSync(ordersFilePath, 'utf8');
        if (data) {
          orders = JSON.parse(data);
        }
      }
      
      // Apply status filter if provided
      const statusFilter = req.query.status as string;
      if (statusFilter && statusFilter !== 'all') {
        orders = orders.filter(order => order.status === statusFilter);
      }
      
      // Sort orders by creation date (newest first)
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Handle pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      
      const paginatedOrders = orders.slice(startIndex, endIndex);
      const totalPages = Math.ceil(orders.length / limit);
      
      res.status(200).json({
        orders: paginatedOrders,
        pagination: {
          totalOrders: orders.length,
          totalPages,
          currentPage: page,
          limit
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
