import { Request, Response } from 'express';
import {
  createSubscription,
  getSubscriptions,
  deleteSubscription,
  getSubscriptionByEmail,
  getSubscriptionById,
  editSubscription,
  getEmailsSubscriptions,
  getDataSubscriptions,
} from './subscription.service';
import { sendBulkEmail } from '../emails/email.service';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};
// Function to handle creating a new subscription
export const handleCreateSubscription = async (req: Request, res: Response) => {
  const { email, name } = req.body;

  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  try {
    const existingSubscription = await getSubscriptionByEmail(email);
    if (existingSubscription) {
      res.status(400).json({ message: 'Email already subscribed' });
      return;
    }

    let nameSuscriptor;

    if (!name) {
      const user = await getDataSubscriptions(email);
      nameSuscriptor = user?.name || 'User';
    }

    const subscription = await createSubscription(email, name || nameSuscriptor);
    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating subscription', error: error.message });
  }
};

// Function to handle getting all subscriptions
export const handleGetSubscriptions = async (_req: Request, res: Response) => {
  try {
    const subscriptions = await getSubscriptions();
    res.status(200).json(subscriptions);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
};

// Function to handle getting subscription by email
export const handleGetSubscriptionByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ message: 'Email is required and must be a string' });
      return;
    }
    const subscription = await getSubscriptionByEmail(email);
    if (!subscription) {
      res.status(404).json({ message: 'This email is not subscribed' });
      return;
    }
    res.status(200).json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
};

// Function to handle getting subscription by Id
export const handleGetSubscriptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: 'Id is required' });
      return;
    }
    const subscription = await getSubscriptionById(Number(id));
    if (!subscription) {
      res.status(404).json({ message: 'Suscription not found' });
      return;
    }
    res.status(200).json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
};

// Function to handle deleting a subscription
export const handleDeleteSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const subscription = await deleteSubscription(Number(id));
    res.status(200).json({ message: 'Subscription deleted', subscription });
  } catch (error: any) {
    if (error.message.includes('Record to delete does not exist')) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }
    res.status(500).json({ message: 'Error deleting subscription', error: error.message });
  }
};

// Function to handle edit a subscription
export const handleEditSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, active } = req.body;

  if (email && !isValidEmail(email)) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  if (active && typeof active !== 'boolean') {
    res.status(400).json({ message: `Active must be a boolean, but received ${typeof active}` });
    return;
  }

  try {
    const subscription = await editSubscription(Number(id), { name, email, active });
    res.status(200).json({ message: 'Subscription updated successfully', subscription });
  } catch (error: any) {
    if (error.message.includes('Record to update not found')) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }
    res.status(500).json({ message: 'Error updating subscription', error: error.message });
  }
};

// Function to handle sending bulk emails
export const handleSendBulk = async (req: Request, res: Response) => {
  const { arrayTo, subject, html } = req.body;
  let to: string[] | null = null;

  if (!arrayTo || arrayTo.length === 0) {
    to = await getEmailsSubscriptions();
    if (!to) {
      res.status(404).json({ message: 'No emails subscribed' });
      return;
    }
  }

  try {
    const info = await sendBulkEmail(arrayTo || to, subject, html);
    res.status(200).json({ message: 'Bulk emails sent successfully', info });
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending bulk emails', error: error.message });
  }
};
