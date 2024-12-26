import { Request, Response } from 'express';
import { orderService } from './order.service';
import { productService } from '../../modules/products/product.service';
import { cartService } from '../../modules/carts/cart.service';
import { Cart } from '../../modules/carts/cart.model';
import { validateCreateOrder, validateUpdateOrder, validateUpdateOrderStatus } from './order.validation';
import { generateInvoicePDF } from '../../utils';
import { sendEmail } from '../../modules/emails/email.service';
import PDFDocument from 'pdfkit';

export const orderController = {
  // Create a new order
  createOrder: async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentType, buyerId, address } = req.body;
      const userId = req.user?.id;

      // Validate main fields
      const { error } = await validateCreateOrder(req.body);
      if (error) {
        res.status(400).json({ message: error });
        return;
      }

      const cart = await Cart.findByUserId(userId);

      if (!cart || cart.products.length === 0) {
        res.status(400).json({ message: 'The cart is empty' });
        return;
      }

      // Extract products and quantities
      const products = cart.products.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        productDetails: item.product,
      }));

      // Check available stock
      for (const item of products) {
        const { productId, quantity } = item;

        const product = await productService.getProductById(productId);
        if (!product) {
          res.status(404).json({ message: `Product with ID ${productId} not found` });
          return;
        }

        if (quantity > product.stock) {
          res.status(400).json({
            message: `The quantity for product ${product.name} exceeds available stock. Current stock: ${product.stock}, requested quantity: ${quantity}`,
          });
          return;
        }
      }

      let totalAmount = 0;
      for (const item of products) {
        const { regularPrice, offerPrice } = item.productDetails;
        const price = offerPrice ?? regularPrice;
        totalAmount += price * item.quantity;
      }
      totalAmount = Number(totalAmount.toFixed(2));
      // Create the order
      const newOrder = await orderService.createOrder({
        userId,
        totalAmount,
        paymentType,
        buyerId,
        addressOrder: address,
        products,
      });

      await cartService.emptyACart(userId);

      res.status(201).json(newOrder);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get all orders
  getAllOrder: async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const orderData = await orderService.getAllOrderPaginated(Number(page), Number(limit));

      res.status(200).json(orderData);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  },

  // Get an order by name or email
  searchOrders: async (req: Request, res: Response): Promise<void> => {
    const { email, name, status, page = 1, limit = 10, order = 'asc' } = req.query;

    try {
      // Validate order direction
      const validOrders = ['asc', 'desc'];
      if (!validOrders.includes(order.toString().toLowerCase())) {
        res.status(400).json({
          message: `Invalid order: ${order}. Allowed values: ${validOrders.join(', ')}`,
        });
        return;
      }

      const upperStatus = status ? (status as string).toUpperCase() : undefined;

      // Call service with the additional order parameter
      const orders = await orderService.searchOrdersByNameOrEmail(
        email as string,
        name as string,
        upperStatus,
        Number(page),
        Number(limit),
        order.toString().toLowerCase()
      );

      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get an order by ID
  getOrderById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const order = await orderService.getOrderById(Number(id));
      res.status(200).json(order);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  },

  // Get orders by user
  getOrdersByUser: async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const order = req.query.order || 'desc';

    const validOrders = ['asc', 'desc'];

    if (!validOrders.includes(order.toString().toLowerCase())) {
      res.status(400).json({
        message: `Invalid order: ${order}. Allowed values: ${validOrders.join(', ')}`,
      });
      return;
    }
    try {
      const result = await orderService.getOrdersByUser(Number(userId), page, limit, order.toString().toLowerCase());

      res.status(200).json({
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalOrders: result.totalOrders,
        orders: result.orders,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // Update order status
  updateOrderById: async (req: Request, res: Response): Promise<void> => {
    if (req.body.totalAmount) {
      res.status(400).json({ message: 'Error: total amount cannot be modified' });
      return;
    }
    const { error } = await validateUpdateOrder(req.body);
    if (error) {
      res.status(400).json({ message: error });
      return;
    }
    const { id } = req.params;
    try {
      const updatedOrder = await orderService.updateOrder(Number(id), req.body);
      res.status(200).json(updatedOrder);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // Update order status
  updateOrderStatus: async (req: Request, res: Response): Promise<void> => {
    const { error } = validateUpdateOrderStatus(req.body);
    if (error) {
      res.status(400).json({ message: error });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;
    try {
      const updatedOrder = await orderService.updateOrderStatus(Number(id), status);
      res.status(200).json(updatedOrder);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get orders by user
  getOrdersByUserLogged: async (req: Request, res: Response): Promise<void> => {
    const id = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const order = req.query.order || 'desc';

    const validOrders = ['asc', 'desc'];
    if (!validOrders.includes(order.toString().toLowerCase())) {
      res.status(400).json({
        message: `Invalid order: ${order}. Allowed values: ${validOrders.join(', ')}`,
      });
      return;
    }
    try {
      const result = await orderService.getOrdersByUser(Number(id), page, limit, order.toString().toLowerCase());

      res.status(200).json({
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalOrders: result.totalOrders,
        orders: result.orders,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get orders by user with filters and pagination
  getOrdersByUserWithFilters: async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { status, paymentType, page = 1, limit = 10, order = 'desc' } = req.query;

    const validOrders = ['asc', 'desc'];
    if (!validOrders.includes(order.toString().toLowerCase())) {
      res.status(400).json({
        message: `Invalid order: ${order}. Allowed values: ${validOrders.join(', ')}`,
      });
      return;
    }

    try {
      const ordersData = await orderService.getOrdersByUserWithFilters(
        order.toString().toLowerCase(),
        Number(limit),
        Number(page),
        Number(userId),
        status as string,
        paymentType as string
      );

      res.status(200).json(ordersData);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // Get metrics
  getMetrics: async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await orderService.getAllOrderMetrics();
      res.status(200).json(metrics);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // Generate PDF invoice and send via email
  generateInvoice: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    try {
      // Generate PDF
      const doc = await generateInvoicePDF(Number(id));

      const chunks: any[] = [];

      // doc is a Readable stream
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // doc is a Writable stream
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);

        // Send email
        await sendEmail(
          email,
          `Invoice for Order #${id}`,
          `<h1>Your invoice for Order #${id} is attached.</h1><p>Thank you for your purchase!</p>`,
          pdfBuffer
        );

        res.status(200).json({ message: `Invoice sent successfully to ${email}`, InvoicePDF: pdfBuffer });
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
};
