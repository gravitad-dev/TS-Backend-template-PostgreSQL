import { Request, Response, NextFunction } from 'express';
import { buyerService } from './buyer.service';
import { validateBuyerCreation, validateBuyerUpdate } from './buyer.validator';

export const buyerController = {
  async createBuyer(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name, email, country, city, zipCode, addressBuyer, phoneNumber, companyName, notes } = req.body;

    const errors = validateBuyerCreation({
      name,
      email,
      country,
      city,
      zipCode,
      addressBuyer,
      phoneNumber,
      companyName,
      notes,
    });

    if (errors.length > 0) {
      res.status(400).json({ message: errors.join(', ') });
      return;
    }

    try {
      const newBuyer = await buyerService.createBuyer({
        name,
        email,
        country,
        city,
        zipCode,
        addressBuyer: addressBuyer || 'Address not specified',
        phoneNumber: phoneNumber || null,
        companyName: companyName || null,
        notes: notes || 'No additional notes',
      });
      res.status(201).json(newBuyer);
    } catch (error) {
      next(error);
    }
  },
  async getAllBuyers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyers = await buyerService.getAllBuyers();
      res.status(200).json(buyers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
  async getbuyerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyer = await buyerService.getBuyerById(parseInt(req.params.id));

      res.status(200).json(buyer);
    } catch (error: any) {
      res.status(error.status).json({ message: error.message });
    }
  },
  async updateBuyer(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name, email, country, city, zipCode, addressBuyer, phoneNumber, companyName, notes } = req.body;

    const errors = validateBuyerUpdate({
      name,
      email,
      country,
      city,
      zipCode,
      addressBuyer,
      phoneNumber,
      companyName,
      notes,
    });

    if (errors.length > 0) {
      res.status(400).json({ message: errors.join(', ') });
      return;
    }

    try {
      const updatedBuyer = await buyerService.updateBuyer(parseInt(req.params.id), {
        name,
        email,
        country,
        city,
        zipCode,
        addressBuyer,
        phoneNumber,
        companyName,
        notes,
      });
      res.status(200).json(updatedBuyer);
    } catch (error: any) {
      res.status(error.status).json({ message: error.message });
    }
  },
  async deleteBuyer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deletedBuyer = await buyerService.deleteBuyer(parseInt(req.params.id));
      res.status(200).json({ message: 'Buyer deleted successfully', deletedBuyer });
    } catch (error: any) {
      res.status(error.status).json({ message: error.message });
    }
  },
};
