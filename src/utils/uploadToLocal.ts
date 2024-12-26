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

export const uploadToLocal = async (
  req: Request
): Promise<{ imageId: number; imageUrl: string; imageName: string }> => {
  if (!req.file) {
    throw new Error('No image file provided');
  }

  // Generate unique filename
  const sanitizedFilename = sanitizeFileName(req.file.originalname);
  const uniqueFilename = `${Date.now()}-${uuidv4()}-${sanitizedFilename}`;
  const uploadDir = path.join(__dirname, '..', '..', 'uploads');

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, uniqueFilename);

  try {
    // Write file to the upload directory
    await fs.promises.writeFile(filePath, req.file.buffer);

    // Save image metadata to the database
    const image = await prisma.image.create({
      data: {
        filename: uniqueFilename,
        filepath: filePath,
      },
    });

    // Return full URL to access the image
    const baseUrl = process.env.URL_BASE ? `${process.env.URL_BASE}` : 'http://localhost:3000';

    return {
      imageId: image.id,
      imageUrl: `${baseUrl}/api/images/image/${uniqueFilename}`,
      imageName: uniqueFilename,
    };
  } catch (error) {
    console.error(`Error uploading file ${req.file.originalname}:`, error);
    throw error;
  }
};
