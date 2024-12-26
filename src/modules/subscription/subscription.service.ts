import { PrismaClient, Subscription } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create a new subscription
export const createSubscription = async (email: string, name?: string) => {
  return await prisma.subscription.create({
    data: {
      email,
      name,
    },
  });
};

// Function to get all subscriptions
export const getSubscriptions = async () => {
  return await prisma.subscription.findMany();
};

// Function to get a subscription by email
export const getSubscriptionByEmail = async (email: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { email },
  });
  if (!subscription) return null;
  return subscription;
};

// Function to get a subscription by Id
export const getSubscriptionById = async (id: number) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id },
  });
  if (!subscription) return null;
  return subscription;
};

// Function to delete a subscription
export const deleteSubscription = async (id: number) => {
  const subscription = await prisma.subscription.delete({
    where: { id },
  });
  if (!subscription) return null;
  return subscription;
};

// Function to edit a subscription
export const editSubscription = async (id: number, data: Partial<Omit<Subscription, 'id'>>) => {
  const subscription = await prisma.subscription.update({
    where: { id },
    data,
  });
  if (!subscription) return null;
  return subscription;
};

// Function to get alls emails subscribed
export const getEmailsSubscriptions = async () => {
  const emailsSubscriptors = await prisma.subscription.findMany({
    select: { email: true },
    where: { active: true },
  });
  if (emailsSubscriptors.length === 0) return null;

  const to = emailsSubscriptors.map((subscription) => subscription.email);
  return to;
};

// Function to get data from users subscribed
export const getDataSubscriptions = async (email: string) => {
  const emailsSubscriptors = await prisma.user.findUnique({ where: { email }, select: { name: true } });
  return emailsSubscriptors;
};
