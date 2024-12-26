import prisma from '../../config/database';

const PaymentType = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  CRYPTO: 'CRYPTO',
} as const;

type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

const searchBuyer = async (buyerId: number) => {
  const buyer = await prisma.buyer.findUnique({
    where: { id: buyerId },
  });
  return buyer;
};

// Validate create order data
export const validateCreateOrder = async (data: any) => {
  const errors: string[] = [];

  if (!data.paymentType || typeof data.paymentType !== 'string') {
    errors.push('paymentType is required and must be a string.');
  } else if (!Object.values(PaymentType).includes(data.paymentType)) {
    errors.push(
      `paymentType must be one of: ${Object.values(PaymentType).join(', ')}.`
    );
  }

  if (!data.address || typeof data.address !== 'string') {
    errors.push('address is required and must be a string.');
  }

  if (!data.buyerId || typeof data.buyerId !== 'number') {
    errors.push('buyerId is required and must be a number.');
  } else if (data.buyerId) {
    const buyer = await searchBuyer(data.buyerId);
    if (!buyer) {
      errors.push('buyer not found.');
    }
  }

  if (errors.length > 0) {
    return { error: errors };
  }

  return { error: null };
};

// Validate update order
export const validateUpdateOrder = async (data: any) => {
  const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];

  const errors: string[] = [];

  if (data.paymentType && typeof data.paymentType !== 'string') {
    errors.push('paymentType must be a string.');
  }
  if (
    data.paymentType &&
    typeof data.paymentType === 'string' &&
    !Object.values(PaymentType).includes(data.paymentType)
  ) {
    errors.push(
      `paymentType must be one of: ${Object.values(PaymentType).join(', ')}.`
    );
  }

  if (data.address && typeof data.address !== 'string') {
    errors.push('address must be a string.');
  }

  if (data.buyerId && typeof data.buyerId !== 'number') {
    errors.push('buyerId must be a number.');
  } else if (data.buyerId) {
    const buyer = await searchBuyer(data.buyerId);
    if (!buyer) {
      errors.push('buyer not found.');
    }
  }

  if (data.status && typeof data.status !== 'string') {
    errors.push('status must be a string.');
  } else if (!validStatuses.includes(data.status)) {
    errors.push('status must be: PENDING, COMPLETED, or CANCELLED.');
  }

  if (errors.length > 0) {
    return { error: errors };
  }

  return { error: null };
};

// Validate update order status data
export const validateUpdateOrderStatus = (data: any) => {
  const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];

  if (!data.status || !validStatuses.includes(data.status)) {
    return {
      error:
        'status is required and must be one of PENDING, COMPLETED, or CANCELLED.',
    };
  }

  return { error: null };
};
