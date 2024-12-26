import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../../hooks';
import { uploadToLocal, uploadMultipleToLocal } from '../../utils';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

router.post(
  '/upload',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Only one file can be uploaded at a time' });
        }
        return res.status(400).json({ message: 'Error uploading file', error: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const result = await uploadToLocal(req);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
  }
);

router.post(
  '/upload-multiple',
  (req: Request, res: Response, next: NextFunction) => {
    upload.array('images')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: 'Error uploading files', error: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const results = await uploadMultipleToLocal(req);
      res.status(200).json(results);
    } catch (error: any) {
      res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
  }
);

router.get('/image/:filename', async (req: Request, res: Response) => {
  const { filename } = req.params;
  const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

router.delete('/delete/:filename', async (req: Request, res: Response) => {
  const { filename } = req.params;

  // Ensure that a filename is provided
  if (!filename) {
    res.status(400).json({ message: 'Filename is required' });
    return;
  }

  const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
  const filePath = path.join(uploadDir, filename);

  try {
    // Check if the file exists in the uploads directory
    if (fs.existsSync(filePath)) {
      // Delete the file from the filesystem
      fs.unlinkSync(filePath);

      // Delete the corresponding entry in the database, if it exists
      await prisma.image.deleteMany({
        where: { filename },
      });

      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});

router.delete('/delete/id/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if an image ID is provided
  if (!id) {
    res.status(400).json({ message: 'Image ID is required' });
    return;
  }
  try {
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
    });

    if (!image) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }

    await prisma.image.delete({
      where: { id: parseInt(id) },
    });

    fs.unlinkSync(image.filepath);

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});

export const imageRouter = router;
