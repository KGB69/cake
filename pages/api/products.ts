import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'products.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      let products = JSON.parse(data);
      
      // Filter by featured status if requested
      const featuredOnly = req.query.featured === 'true';
      if (featuredOnly) {
        products = products.filter((product: any) => product.featured === true);
      }
      
      // Filter by category if provided
      const category = req.query.category as string;
      if (category && category !== 'all') {
        products = products.filter((product: any) => 
          product.category?.toLowerCase() === category.toLowerCase()
        );
      }
      
      // Filter by stock status if provided
      const stockStatus = req.query.stockStatus as string;
      if (stockStatus) {
        switch (stockStatus) {
          case 'in-stock':
            products = products.filter((product: any) => (product.stock || 0) > 0);
            break;
          case 'out-of-stock':
            products = products.filter((product: any) => (product.stock || 0) === 0);
            break;
          case 'low-stock':
            products = products.filter((product: any) => {
              const stock = product.stock || 0;
              return stock > 0 && stock <= 5;
            });
            break;
        }
      }
      
      // Sort by stock level if requested
      const sortBy = req.query.sortBy as string;
      if (sortBy === 'stock-asc') {
        products.sort((a: any, b: any) => (a.stock || 0) - (b.stock || 0));
      } else if (sortBy === 'stock-desc') {
        products.sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0));
      }
      
      // Get unique categories for category browsing
      const categories = Array.from(
        new Set(JSON.parse(data).map((product: any) => product.category))
      );
      
      // Handle pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      
      const paginatedProducts = products.slice(startIndex, endIndex);
      const totalPages = Math.ceil(products.length / limit);
      
      res.status(200).json({
        products: paginatedProducts,
        categories,
        pagination: {
          totalProducts: products.length,
          totalPages,
          currentPage: page,
          limit
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read products' });
    }
  } else if (req.method === 'POST') {
    const newProduct = req.body;
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const products = JSON.parse(data);
      products.push(newProduct);
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add product' });
    }
  } else if (req.method === 'PUT') {
    const { id, ...updatedProduct } = req.body;
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      let products = JSON.parse(data);
      products = products.map((product: any) => product.id === id ? { ...product, ...updatedProduct } : product);
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      let products = JSON.parse(data);
      const initialLength = products.length;
      // Log the ID we're trying to delete for debugging
      console.log('Attempting to delete product with ID:', id);
      
      // Ensure we have a consistent ID format for comparison
      const stringId = String(id).trim();
      
      // Log the products before filtering
      console.log('Products before filtering:', products.map((p: { id: string | number }) => p.id));
      
      // Apply strict string comparison
      products = products.filter((product: any) => {
        const productIdStr = String(product.id).trim();
        const shouldKeep = productIdStr !== stringId;
        console.log(`Product ID: ${productIdStr}, Target ID: ${stringId}, Keep: ${shouldKeep}`);
        return shouldKeep;
      });
      if (products.length < initialLength) {
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        res.status(200).json({ message: 'Product deleted' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
