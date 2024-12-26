// hooks/useCheckTransaction.hook.ts
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { convertWeiToUSD } from '../hooks';

const prisma = new PrismaClient();
const REQUIRED_CONFIRMATIONS = 8;
const MAX_WAIT_TIME = 300000;
let currentConfirmations = 0;

export async function checkTransaction(
  transactionHash: string,
  address: string,
  userId: number,
  orderId: number
): Promise<any> {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL);

  const startTime = Date.now();

  while (true) {
    try {
      const transaction = await provider.getTransaction(transactionHash);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const transactionValueInWei = transaction.value;
      const valueInUSD = await convertWeiToUSD(transactionValueInWei);
      const amountInEther = Number(transactionValueInWei) / 10 ** 18;
      const currentBlock = await provider.getBlockNumber();
      currentConfirmations = transaction.blockNumber ? currentBlock - transaction.blockNumber + 1 : 0;
      const transactionStatus = currentConfirmations < REQUIRED_CONFIRMATIONS ? 'Confirming' : 'Completed';

      if (transaction.from.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Sender address does not match');
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('Error: order not found');
      }

      if (transactionStatus === 'Completed') {
        await prisma.payment.create({
          data: {
            transactionHash,
            addressPayment: address,
            status: transactionStatus,
            confirmations: currentConfirmations,
            userId,
            amount: order?.totalAmount * 100,
            amountCrypto: amountInEther + ' ETH',
            orderId,
          },
        });

        return {
          verified: true,
          message: 'Transaction is completed.',
          transactionStatus,
          currentConfirmations,
          requiredConfirmations: REQUIRED_CONFIRMATIONS,
          remainingConfirmations: 0,
          amountInUSDcents: valueInUSD,
          amountInEther: amountInEther + ' ETH',
        };
      }

      console.log(
        `Waiting for more confirmations: currently at ${currentConfirmations} out of ${REQUIRED_CONFIRMATIONS}.`
      );

      if (Date.now() - startTime >= MAX_WAIT_TIME) {
        throw new Error('Timeout exceeded: Confirmations not reached within allowed time.');
      }

      await new Promise((resolve) => setTimeout(resolve, 15000));
    } catch (error) {
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      const remainingConfirmations = Math.max(0, REQUIRED_CONFIRMATIONS - currentConfirmations);

      return {
        verified: false,
        message: errorMessage + ' Try again',
        transactionStatus: 'Error',
        currentConfirmations: 0,
        requiredConfirmations: REQUIRED_CONFIRMATIONS,
        remainingConfirmations: remainingConfirmations,
      };
    }
  }
}
