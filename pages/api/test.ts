import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ 
    message: 'API is working correctly', 
    time: new Date().toISOString(),
    method: req.method
  });
}
