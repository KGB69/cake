import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'products.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    // Create empty products file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }

  // Process DELETE differently to use body instead of query
  if (req.method === 'DELETE') {
    try {
      // Read request body for ID
      const productId = req.body?.id;
      
      console.log('DELETE request received with body:', req.body);
      console.log('Product ID to delete:', productId);
      
      if (!productId && productId !== '') {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      // Read products file
      const data = fs.readFileSync(filePath, 'utf8');
      let products = JSON.parse(data);
      const initialLength = products.length;

      // Use strict string comparison
      const stringId = String(productId).trim();
      console.log('Trying to delete product with ID (stringified):', stringId);
      
      // Filter out the product to delete
      products = products.filter((product: any) => {
        const productIdStr = String(product.id).trim();
        const matches = productIdStr !== stringId;
        if (!matches) {
          console.log('Found matching product to delete:', product);
        }
        return matches;
      });

      if (products.length < initialLength) {
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        res.status(200).json({ message: 'Product deleted', id: stringId });
      } else {
        console.log('No product found with ID:', stringId);
        console.log('Available product IDs:', products.map((p: any) => String(p.id).trim()));
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
    return;
  }

  // Handle GET, POST, PUT methods
  if (req.method === 'GET') {
    try {
      // Check if file exists before reading
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }

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
      console.error('Error reading products:', error);
      res.status(500).json({ error: 'Failed to read products' });
    }
  } else if (req.method === 'POST') {
    const newProduct = req.body;

    // Generate a unique ID for the new product using timestamp
    if (!newProduct.id) {
      newProduct.id = `prod_${Date.now()}`;
    }

    try {
      // Create empty file if it doesn't exist
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }

      const data = fs.readFileSync(filePath, 'utf8');
      const products = JSON.parse(data);
      products.push(newProduct);
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Failed to add product' });
    }
  } else if (req.method === 'PUT') {
    const { id, ...updatedProduct } = req.body;
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      let products = JSON.parse(data);

      const stringId = String(id).trim();

      // Find the product by ID
      const productIndex = products.findIndex((p: any) => String(p.id).trim() === stringId);

      if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Update the product
      products[productIndex] = { ...products[productIndex], ...updatedProduct, id };
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
      res.status(200).json(products[productIndex]);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
