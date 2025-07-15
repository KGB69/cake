import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'products.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('EMPTY-ID API ENDPOINT CALLED:', req.method);
  if (req.method === 'DELETE') {
    try {
      // Read existing products
      const data = fs.readFileSync(filePath, 'utf8');
      let products = JSON.parse(data);
      const initialLength = products.length;
      
      // Log for debugging
      console.log('EMPTY-ID HANDLER: Before removal:', products.length, 'products');
      console.log('EMPTY-ID HANDLER: Products with empty IDs:', products.filter((p: any) => p.id === '').length);
      console.log('EMPTY-ID HANDLER: Full product list:', products.map((p: any) => ({ id: p.id, name: p.name })));
      
      // Remove products with empty IDs
      products = products.filter((product: any) => {
        const hasEmptyId = product.id === '';
        if (hasEmptyId) {
          console.log('Found product with empty ID to delete:', product.name);
        }
        return !hasEmptyId;
      });
      
      console.log('After removal:', products.length, 'products');
      
      if (products.length < initialLength) {
        // Write updated products back to file
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        res.status(200).json({ 
          message: `Deleted ${initialLength - products.length} products with empty IDs`,
          deletedCount: initialLength - products.length
        });
      } else {
        res.status(404).json({ error: 'No products with empty IDs found' });
      }
    } catch (error) {
      console.error('Error deleting products with empty IDs:', error);
      res.status(500).json({ error: 'Failed to delete products' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
