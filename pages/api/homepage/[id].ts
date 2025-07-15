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
  
  if (!isAdmin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const homepageData = getHomepageData();
      const contentIndex = homepageData.content.findIndex(item => item.id === id);
      
      if (contentIndex === -1) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      const updateData = req.body;
      const contentToUpdate = homepageData.content[contentIndex];
      
      homepageData.content[contentIndex] = {
        ...contentToUpdate,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      saveHomepageData(homepageData);
      
      return res.status(200).json(homepageData.content[contentIndex]);
    } 
    else if (req.method === 'DELETE') {
      const homepageData = getHomepageData();
      const contentIndex = homepageData.content.findIndex(item => item.id === id);
      
      if (contentIndex === -1) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      // Don't delete if it's the last item
      if (homepageData.content.length <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last homepage content item' });
      }
      
      // If deleting the active item, set another one as active
      if (homepageData.content[contentIndex].isActive && homepageData.content.length > 1) {
        const newActiveIndex = contentIndex === 0 ? 1 : 0;
        homepageData.content[newActiveIndex].isActive = true;
      }
      
      homepageData.content.splice(contentIndex, 1);
      saveHomepageData(homepageData);
      
      return res.status(200).json({ message: 'Content deleted successfully' });
    }
    else if (req.method === 'PATCH' && req.body.action === 'setActive') {
      const homepageData = getHomepageData();
      const contentIndex = homepageData.content.findIndex(item => item.id === id);
      
      if (contentIndex === -1) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      // Set all items to inactive
      homepageData.content.forEach(item => {
        item.isActive = false;
      });
      
      // Set the selected item to active
      homepageData.content[contentIndex].isActive = true;
      homepageData.content[contentIndex].updatedAt = new Date().toISOString();
      
      // Save the updated data
      saveHomepageData(homepageData);
      
      // Clear any potential cache by adding a timestamp parameter to avoid browser caching
      const updatedContent = {
        ...homepageData.content[contentIndex],
        cacheKey: Date.now()
      };
      
      return res.status(200).json(updatedContent);
    }
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling homepage data:', error);
    return res.status(500).json({ message: 'Error handling homepage data' });
  }
}

function getHomepageData(): { content: HomepageContent[] } {
  try {
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
