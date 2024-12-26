import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to sanitize file name
const sanitizeFileName = (filename: string) => {
  return filename
    .toLowerCase()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-z0-9_.-]/g, ''); // Remove special characters (except . and _)
};

export const uploadMultipleToLocal = async (req: Request): Promise<Array<{ imageId: number; imageUrl: string }>> => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new Error('No image files provided');
  }

  const uploadDir = path.join(__dirname, '..', '..', 'uploads');

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const baseUrl = process.env.URL_BASE ? `${process.env.URL_BASE}` : 'http://localhost:3000';

  const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
    try {
      // Generate unique sanitized filename
      const sanitizedFilename = sanitizeFileName(file.originalname);
      const uniqueFilename = `${Date.now()}-${uuidv4()}-${sanitizedFilename}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      // Write file to the upload directory
      await fs.promises.writeFile(filePath, file.buffer);

      // Save image metadata to the database
      const image = await prisma.image.create({
        data: {
          filename: uniqueFilename,
          filepath: filePath,
        },
      });

      // Return full URL to access the image
      return {
        imageId: image.id,
        imageUrl: `${baseUrl}/api/images/image/${uniqueFilename}`,
      };
    } catch (error) {
      console.error(`Error uploading file ${file.originalname}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};
