import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { HomepageContent } from '@/types/homepage';

const homepageFilePath = path.join(process.cwd(), 'data', 'homepage.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if user is authenticated as admin
  // This should be replaced with proper authentication in production
  const isAdmin = req.headers['x-admin-token'] === 'admin-session-active';

  try {
    if (req.method === 'GET') {
      // Public access to get homepage content
      const homepageData = getHomepageData();
      const activeContent = homepageData.content.find(item => item.isActive) || homepageData.content[0];
      return res.status(200).json({ 
        content: activeContent 
      });
    }
    else if (req.method === 'POST' && isAdmin) {
      // Create new homepage content variant (admin only)
      const homepageData = getHomepageData();
      const newContent = req.body;
      
      const contentToSave = {
        id: `hero-${Date.now()}`,
        heroImage: newContent.heroImage || '',
        heroTitle: newContent.heroTitle || 'Welcome to Cakelandia',
        heroSubtitle: newContent.heroSubtitle || 'Delicious pastries for every occasion',
        heroButtonText: newContent.heroButtonText || 'Shop Now',
        heroButtonLink: newContent.heroButtonLink || '/products',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      homepageData.content.push(contentToSave);
      saveHomepageData(homepageData);
      
      return res.status(201).json(contentToSave);
    }
    else {
      return res.status(405).json({ message: 'Method not allowed or unauthorized' });
    }
  } catch (error) {
    console.error('Error handling homepage data:', error);
    return res.status(500).json({ message: 'Error handling homepage data' });
  }
}

function getHomepageData(): { content: HomepageContent[] } {
  try {
    if (!fs.existsSync(homepageFilePath)) {
      // Create default if file doesn't exist
      const defaultData = {
        content: [
          {
            id: 'default',
            heroImage: '/images/hero-default.jpg',
            heroTitle: 'Welcome to Cakelandia',
            heroSubtitle: 'Delicious pastries for every occasion',
            heroButtonText: 'Shop Now',
            heroButtonLink: '/products',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
      fs.writeFileSync(homepageFilePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }

    const fileContent = fs.readFileSync(homepageFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading homepage data:', error);
    throw error;
  }
}

function saveHomepageData(data: { content: HomepageContent[] }) {
  try {
    fs.writeFileSync(homepageFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving homepage data:', error);
    throw error;
  }
}
