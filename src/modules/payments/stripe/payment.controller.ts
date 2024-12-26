import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

const paymentService = new PaymentService();

export class PaymentController {
  public static async createPaymentIntent(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const {
        currency,
        paymentMethodId,
        orderId,
      }: {
        currency: string;
        paymentMethodId: string;
        orderId: number;
      } = req.body;
      const userId = req.user?.id;

      if (!orderId) {
        res.status(400).json({ error: 'Missing orderId' });
        return;
      }

      const result = await paymentService.createPaymentIntent({
        currency,
        paymentMethodId,
        userId: userId as number,
        orderId,
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in createPaymentIntent:', error);
      res
        .status(400)
        .json({ error: error.message || 'Error creating payment intent' });
    }
  }

  // Get payments by Id
  public static async getPaymentById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Missing payment ID' });
        return;
      }

      const payment = await paymentService.getPaymentById(Number(id));

      if (!payment) {
        res.status(404).json({ error: `Payment with ID ${id} not found` });
        return;
      }

      res.status(200).json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get payments by day (last 7 days)
  public static async getSalesByLast7Day(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const salesByLast7Day = await paymentService.getSalesByLast7Day();
      res.status(200).json({ salesByLast7Day });
    } catch (error: any) {
      console.error('Error in getPaymentsByDay:', error);
      res.status(500).json({ error: 'Error getting payments per day' });
    }
  }

  // Get total sales
  public static async getTotalSales(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const totalSales = await paymentService.getTotalSales();
      res.status(200).json({ totalSales });
    } catch (error: any) {
      console.error('Error in getTotalSales:', error);
      res.status(500).json({ error: 'Error getting total sales' });
    }
  }

  // Get total revenue
  public static async getTotalRevenue(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const totalRevenue = await paymentService.getTotalRevenue();
      res.status(200).json({ totalRevenue });
    } catch (error: any) {
      console.error('Error in getTotalRevenue:', error);
      res.status(500).json({ error: 'Error getting total revenue' });
    }
  }

  // Get sales by month
  public static async getSalesByMonth(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const salesByMonth = await paymentService.getSalesByMonth();
      res.status(200).json({ salesByMonth });
    } catch (error: any) {
      console.error('Error in getSalesByMonth:', error);
      res.status(500).json({ error: 'Error getting sales by month' });
    }
  }

  // Get revenue by month
  public static async getRevenueByMonth(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const revenueByMonth = await paymentService.getRevenueByMonth();
      res.status(200).json({ revenueByMonth });
    } catch (error: any) {
      console.error('Error in getRevenueByMonth:', error);
      res.status(500).json({ error: 'Error getting revenue by month' });
    }
  }

  // Get sales for the current month with zero-filled days
  public static async getSalesThisMonth(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const salesThisMonth = await paymentService.getSalesThisMonth();
      res.status(200).json({ salesThisMonth });
    } catch (error: any) {
      console.error('Error in getSalesThisMonth:', error);
      res.status(500).json({ error: 'Error getting sales for this month' });
    }
  }
}
