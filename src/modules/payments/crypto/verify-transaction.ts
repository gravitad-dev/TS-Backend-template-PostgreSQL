import { Request, Response } from 'express';
import { checkTransaction } from '../../../hooks';
import { PrismaClient, Payment, Status_Order } from '@prisma/client';
import { VerifyTransactionResponse } from '../../../types';

const prisma = new PrismaClient();
const confirmations = 8;

export default async function cryptoPayment(
  req: Request,
  res: Response<VerifyTransactionResponse>
): Promise<void> {
  const userId = req.user?.id;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      verified: false,
      message: `Method ${req.method} Not Allowed`,
      transactionStatus: 'Pending',
      currentConfirmations: 0,
      requiredConfirmations: confirmations,
      remainingConfirmations: confirmations,
    });
    return;
  }

  const {
    transactionHash,
    address,
    orderId,
  }: { transactionHash: string; address: string; orderId: number } = req.body;

  if (!transactionHash || !address || !orderId || !userId) {
    res.status(400).json({
      verified: false,
      message: 'Missing required fields',
      transactionStatus: 'Pending',
      currentConfirmations: 0,
      requiredConfirmations: confirmations,
      remainingConfirmations: confirmations,
    });
    return;
  }

  // Check if the transaction already exists
  const existingTransaction: Payment | null = await prisma.payment.findFirst({
    where: { transactionHash },
  });

  if (existingTransaction) {
    res.status(400).json({
      verified: true,
      message: 'Transaction already exists in the database.',
      transactionStatus: 'Error',
      address,
      transaction: existingTransaction.transactionHash || undefined,
      currentConfirmations: confirmations,
      requiredConfirmations: confirmations,
      remainingConfirmations: 0,
    });
    return;
  }

  // Verify the transaction on the blockchain
  const result = await checkTransaction(
    transactionHash,
    address,
    userId,
    orderId
  );

  if (result.verified) {
    // Update the order status to COMPLETED if the transaction is valid
    await prisma.order.update({
      where: { id: orderId },
      data: { status: Status_Order.COMPLETED },
    });

    // Get the order products from the OrderProduct table
    const orderProducts = await prisma.orderProduct.findMany({
      where: { orderId },
      include: {
        product: true, // Include product details
      },
    });

    // Reduce the stock of each product in the order
    for (const orderProduct of orderProducts) {
      await prisma.product.update({
        where: { id: orderProduct.productId },
        data: {
          stock: {
            decrement: orderProduct.quantity, 
          },
        },
      });
    }
  }

  res.status(result.verified ? 200 : 400).json(result);
}
