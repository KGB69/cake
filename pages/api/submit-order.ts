import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { Order, OrderStatus, OrderItem } from '@/types/order';
import { Product } from '@/types/product';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    stock?: number;
    description?: string;
    image?: string;
    category?: string;
  };
  quantity: number;
}

interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  total: number;
  notes?: string;
}

interface StockIssue {
  productId: string;
  name: string;
  requested: number;
  available: number;
}

interface InventoryCheckResult {
  success: boolean;
  stockIssues?: StockIssue[];
  updatedProducts?: any[];
}

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

// Generate a random tracking number
function generateTrackingNumber(): string {
  const prefix = 'CKL';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { orderData } = req.body as { orderData: OrderData }; // Expect order data from frontend
      
      // Verify inventory availability before processing
      const inventoryCheck = await checkAndUpdateInventory(orderData.items);
      
      if (!inventoryCheck.success) {
        return res.status(400).json({
          message: 'Inventory validation failed',
          stockIssues: inventoryCheck.stockIssues
        });
      }
      
      // Create new order with tracking number
      const trackingNumber = generateTrackingNumber();
      const now = new Date().toISOString();
      
      const newOrder: Order = {
        id: now + Math.random().toString(36).substring(2, 9),
        trackingNumber,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        address: orderData.address,
        items: orderData.items.map(item => {
          // Convert CartItem to OrderItem by ensuring product has all required fields
          const product: Product = {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            // Provide default values for required Product fields
            description: item.product.description || '',
            image: item.product.image || '/images/placeholder.jpg',
            category: item.product.category || 'other',
            stock: item.product.stock
          };
          
          return {
            product,
            quantity: item.quantity
          } as OrderItem;
        }),
        total: orderData.total,
        status: 'pending' as OrderStatus,
        createdAt: now,
        updatedAt: now,
        notes: orderData.notes
      };
      
      // Save order to file
      const orders: Order[] = [];
      if (fs.existsSync(ordersFilePath)) {
        const data = fs.readFileSync(ordersFilePath, 'utf8');
        if (data) {
          orders.push(...JSON.parse(data));
        }
      }
      orders.push(newOrder);
      fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
      
      // Update product inventory in database (already validated and reserved in checkAndUpdateInventory)
      if (inventoryCheck.updatedProducts) {
        await saveUpdatedProducts(inventoryCheck.updatedProducts);
      }
      
      // Send email notification
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'owner@example.com', // Replace with your admin email
        subject: `New Order Placed - ${trackingNumber}`,
        text: `
New order received:

Tracking: ${trackingNumber}
Customer: ${orderData.customerName}
Email: ${orderData.customerEmail}
Phone: ${orderData.customerPhone}
Address: ${orderData.address}

Items:
${Array.isArray(orderData.items) ? orderData.items.map(item => `- ${item.product.name} x ${item.quantity} ($${item.product.price} each)`).join('\n') : 'None'}

Total: $${orderData.total.toFixed(2)}

Notes: ${orderData.notes || 'None'}
`,
      };
      
      await transporter.sendMail(mailOptions);
      
      res.status(200).json({ 
        message: 'Order submitted successfully', 
        trackingNumber,
        orderId: newOrder.id
      });
    } catch (error) {
      console.error('Order submission error:', error);
      res.status(500).json({ message: 'Failed to submit order' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Verify inventory and update stock levels
async function checkAndUpdateInventory(items: CartItem[]): Promise<InventoryCheckResult> {
  // Read current product inventory
  let products: any[] = [];
  if (fs.existsSync(productsFilePath)) {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    if (data) {
      products = JSON.parse(data);
    }
  }
  
  // Check if all items are available in requested quantities
  const stockIssues: {productId: string, name: string, requested: number, available: number}[] = [];
  const updatedProducts = [...products];
  
  for (const item of items) {
    const productId = item.product.id;
    const requestedQty = item.quantity || 1;
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      stockIssues.push({
        productId,
        name: item.product.name,
        requested: requestedQty,
        available: 0
      });
      continue;
    }
    
    const product = products[productIndex];
    // If stock is undefined or null, we assume unlimited stock
    if (product.stock !== undefined && product.stock !== null) {
      if (product.stock < requestedQty) {
        stockIssues.push({
          productId,
          name: product.name,
          requested: requestedQty,
          available: product.stock
        });
        continue;
      }
      
      // Reduce stock if available
      updatedProducts[productIndex] = {
        ...product,
        stock: product.stock - requestedQty
      };
    }
  }
  
  if (stockIssues.length > 0) {
    return {
      success: false,
      stockIssues
    };
  }
  
  return {
    success: true,
    updatedProducts
  };
}

// Save updated product inventory
async function saveUpdatedProducts(products: any[]): Promise<void> {
  return fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}
