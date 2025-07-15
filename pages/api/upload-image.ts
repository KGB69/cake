import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Disable the default body parser to allow formidable to parse the request
export const config = {
  api: {
    bodyParser: false,
  },
};

type ProcessedFiles = {
  success: boolean;
  fileUrl?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const result = await processFormData(req, uploadsDir);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json({ fileUrl: result.fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
}

// Process form data and resize/save the file
function processFormData(req: NextApiRequest, uploadDir: string): Promise<ProcessedFiles> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      filter: (part: formidable.Part) => {
        return part.mimetype?.includes('image') || false;
      }
    });

    form.parse(req, async (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        return resolve({ success: false, message: 'Error parsing form data' });
      }

      const fileArray = files.image as formidable.File[];
      
      if (!fileArray || fileArray.length === 0) {
        return resolve({ success: false, message: 'No image provided' });
      }

      const file = fileArray[0];
      
      if (!file.mimetype?.includes('image')) {
        return resolve({ success: false, message: 'File is not an image' });
      }

      // Create a safe filename with timestamp
      const timestamp = new Date().getTime();
      const fileExt = path.extname(file.originalFilename || 'image.jpg');
      const newFilename = `image-${timestamp}${fileExt}`;
      const newPath = path.join(uploadDir, newFilename);

      try {
        // Resize the image to max dimensions of 1080x1080 while maintaining aspect ratio
        await sharp(file.filepath)
          .resize({
            width: 1080,
            height: 1080,
            fit: sharp.fit.inside,
            withoutEnlargement: true // Don't enlarge if smaller than 1080px
          })
          .toFile(newPath);

        // Remove the original temp file
        fs.unlinkSync(file.filepath);
        
        // Return the relative URL to the file
        const fileUrl = `/uploads/${newFilename}`;
        resolve({ success: true, fileUrl });
      } catch (error) {
        console.error('Error processing image:', error);
        resolve({ success: false, message: 'Error processing image' });
      }
    });
  });
}
