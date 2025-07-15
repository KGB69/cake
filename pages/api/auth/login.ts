import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

// Default admin credentials - for production, use environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cakelandia2025';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    
    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set HTTP-only secure cookie with admin token
      const token = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create secure HTTP-only cookie
      const cookie = serialize('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });
      
      // Set cookie header
      res.setHeader('Set-Cookie', cookie);
      
      return res.status(200).json({ 
        success: true,
        message: 'Authentication successful'
      });
    } else {
      // Authentication failed
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
