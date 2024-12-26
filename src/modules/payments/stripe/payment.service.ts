import stripe from '../../../config/stripe';
import { PrismaClient, Status_Order } from '@prisma/client';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const prismaClient = new PrismaClient();

interface CreatePaymentDTO {
  currency: string;
  paymentMethodId: string;
  userId: number;
  orderId: number;
}

export class PaymentService {
  public async createPaymentIntent({ currency, paymentMethodId, userId, orderId }: CreatePaymentDTO) {
    try {
      return await prismaClient.$transaction(async (prisma) => {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            orderProducts: {
              include: {
                product: true,
              },
            },
          },
        });

        if (!order) {
          throw new Error('Order not found');
        }

        if (order.userId !== userId) {
          throw new Error('Order does not belong to the user');
        }

        const amount = Math.round(order.totalAmount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          payment_method: paymentMethodId,
          confirm: true,
          return_url: `${process.env.URL_BASE}/api/payments/payment-success`,
        });

        const payment = await prisma.payment.create({
          data: {
            stripeId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            userId,
            orderId,
          },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { status: Status_Order.COMPLETED },
        });

        const stockDecrementPromises = order.orderProducts.map((orderProduct) =>
          prisma.product.update({
            where: { id: orderProduct.productId },
            data: {
              stock: {
                decrement: orderProduct.quantity,
              },
            },
          })
        );

        await Promise.all(stockDecrementPromises);

        return { success: true, payment };
      });
    } catch (error: any) {
      console.error('Error in createPaymentIntent:', error);
      throw new Error('Error processing payment: ' + error.message);
    }
  }

  // Get payments by ID
  public async getPaymentById(id: number) {
    try {
      if (isNaN(id)) {
        throw new Error('ID must be a number');
      }

      const payment = await prismaClient.payment.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              orderProducts: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }

      return payment;
    } catch (error: any) {
      console.error('Error in getPaymentById:', error);
      throw new Error('Error: ' + error.message);
    }
  }

  // Get payments by day (last 7 days)
  public async getSalesByLast7Day(): Promise<any> {
    try {
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i));

      const payments = await prismaClient.payment.findMany({
        where: {
          createdAt: {
            gte: startOfDay(last7Days[6]),
            lte: endOfDay(today),
          },
        },
        select: {
          createdAt: true,
        },
      });

      const groupedPayments = last7Days.map((day) => {
        const formattedDay = format(day, 'yyyy-MM-dd');
        const paymentsForDay = payments.filter((p) => format(p.createdAt, 'yyyy-MM-dd') === formattedDay);
        return {
          dayOfWeek: day.toLocaleDateString('en-EN', { weekday: 'long' }),
          paymentsCount: paymentsForDay.length,
        };
      });

      return groupedPayments;
    } catch (error: any) {
      console.error('Error in getPaymentsByDay:', error);
      throw new Error('Error retrieving payments by day: ' + error.message);
    }
  }

  // Count total sales
  public async getTotalSales(): Promise<number> {
    try {
      const totalSales = await prismaClient.payment.count();
      return totalSales;
    } catch (error: any) {
      console.error('Error in getTotalSales:', error);
      throw new Error('Error counting total sales: ' + error.message);
    }
  }

  // Calculate total revenue
  public async getTotalRevenue(): Promise<{ totalRevenue: number }> {
    try {
      const result = await prismaClient.payment.aggregate({
        _sum: {
          amount: true,
        },
      });

      // Convert total cents to dollars or the corresponding currency
      const totalRevenueInDollars = (result._sum.amount || 0) / 100;

      return { totalRevenue: totalRevenueInDollars };
    } catch (error: any) {
      console.error('Error in getTotalRevenue:', error);
      throw new Error('Error calculating total revenue: ' + error.message);
    }
  }

  // Get sales by month
  public async getSalesByMonth(): Promise<{ year: number; month: number; amount: number }[]> {
    try {
      const salesByMonth = await prismaClient.$queryRaw<{ year: number; month: number; amount: bigint }[]>`
        SELECT 
          EXTRACT(YEAR FROM "createdAt") AS year,
          EXTRACT(MONTH FROM "createdAt") AS month,
          COUNT(id) AS "amount"
        FROM "Payment"
        GROUP BY year, month
        ORDER BY year ASC, month ASC
      `;

      // Convert BigInt to Number
      const formattedSales = salesByMonth.map((item) => ({
        year: item.year,
        month: item.month,
        amount: Number(item.amount),
      }));

      return formattedSales;
    } catch (error: any) {
      console.error('Error in getSalesByMonth:', error);
      throw new Error('Failed to retrieve sales by month: ' + error.message);
    }
  }

  // Get revenue by month
  public async getRevenueByMonth(): Promise<{ year: number; month: number; totalRevenue: number }[]> {
    try {
      const revenueByMonth = await prismaClient.$queryRaw<{ year: number; month: number; totalRevenue: bigint }[]>`
        SELECT 
          EXTRACT(YEAR FROM "createdAt") AS year,
          EXTRACT(MONTH FROM "createdAt") AS month,
          SUM(amount) AS "totalRevenue"
        FROM "Payment"
        GROUP BY year, month
        ORDER BY year ASC, month ASC
      `;

      // Convert BigInt to Number and cents to dollars
      const formattedRevenue = revenueByMonth.map((item) => ({
        year: item.year,
        month: item.month,
        totalRevenue: Number(item.totalRevenue) / 100, // Assuming `amount` is in cents
      }));

      return formattedRevenue;
    } catch (error: any) {
      console.error('Error in getRevenueByMonth:', error);
      throw new Error('Failed to retrieve revenue by month: ' + error.message);
    }
  }

  // Get sales for the current month
  public async getSalesThisMonth(): Promise<{ date: string; salesCount: number }[]> {
    try {
      const today = new Date();
      const startMonth = startOfMonth(today);
      const endMonth = endOfMonth(today);
      const allDays = eachDayOfInterval({ start: startMonth, end: endMonth });

      // Query payments for the current month
      const payments = await prismaClient.payment.findMany({
        where: {
          createdAt: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        select: {
          createdAt: true,
        },
      });

      // Map payments to counts per day
      const salesMap: { [key: string]: number } = {};

      payments.forEach((payment) => {
        const day = format(payment.createdAt, 'yyyy-MM-dd');
        if (salesMap[day]) {
          salesMap[day]++;
        } else {
          salesMap[day] = 1;
        }
      });

      // Prepare the result, filling days with zero sales
      const salesThisMonth = allDays.map((day) => {
        const formattedDay = format(day, 'yyyy-MM-dd');
        return {
          date: formattedDay,
          salesCount: salesMap[formattedDay] || 0,
        };
      });

      return salesThisMonth;
    } catch (error: any) {
      console.error('Error in getSalesThisMonth:', error);
      throw new Error('Failed to retrieve sales for this month: ' + error.message);
    }
  }
}
