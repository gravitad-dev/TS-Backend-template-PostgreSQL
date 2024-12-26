import { PrismaClient, Payment_Order, Status_Order, Order } from '@prisma/client';

const prisma = new PrismaClient();

export const orderService = {
  createOrder: async (data: {
    userId: number;
    totalAmount: number;
    paymentType: Payment_Order;
    buyerId: number;
    addressOrder: string;
    products: Array<{ productId: number; quantity: number }>;
  }) => {
    try {
      const newOrder = await prisma.$transaction(async (prisma) => {
        const order = await prisma.order.create({
          data: {
            userId: data.userId,
            buyerId: data.buyerId,
            totalAmount: data.totalAmount,
            paymentType: data.paymentType,
            addressOrder: data.addressOrder,
            status: Status_Order.PENDING,
          },
        });

        const orderProducts = await Promise.all(
          data.products.map((product) =>
            prisma.orderProduct.create({
              data: {
                orderId: order.id,
                productId: product.productId,
                quantity: product.quantity,
              },
            })
          )
        );

        return { order, orderProducts };
      });

      return newOrder;
    } catch (error: any) {
      console.error(error);
      throw new Error(`Error creating order: ${error.message}`);
    }
  },

  // Get all orders
  getAllOrderPaginated: async (page: number, limit: number) => {
    try {
      const pageNumber = page || 1;
      const pageSize = limit || 10;

      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              username: true,
              role: true,
              active: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          buyer: true,
          orderProducts: {
            include: {
              product: true,
            },
          },
        },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      });

      const totalOrders = await prisma.order.count();

      if (!orders) throw new Error('Orders not found');

      return {
        totalPages: Math.ceil(totalOrders / pageSize),
        currentPage: pageNumber,
        totalOrders,
        orders,
      };
    } catch (error: any) {
      console.error(error);
      throw new Error(`Error fetching orders: ${error.message}`);
    }
  },

  //Get an order by name or email
  searchOrdersByNameOrEmail: async (
    email?: string,
    name?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
    order: string = 'asc'
  ) => {
    try {
      let statusEnum: Status_Order | undefined;

      if (status === 'PENDING' || status === 'COMPLETED' || status === 'CANCELLED') {
        statusEnum = status as Status_Order;
      }

      const skip = (page - 1) * limit;
      const take = limit;

      // Fetch orders with filters and ordering
      const orders = await prisma.order.findMany({
        where: {
          ...(email && { user: { email } }),
          ...(name && {
            user: { name: { contains: name, mode: 'insensitive' } },
          }),
          ...(statusEnum && { status: statusEnum }),
        },
        include: {
          user: true,
          buyer: true,
          orderProducts: {
            include: {
              product: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: order.toLowerCase() as 'asc' | 'desc' },
      });

      const totalOrders = await prisma.order.count({
        where: {
          ...(email && { user: { email } }),
          ...(name && {
            user: { name: { contains: name, mode: 'insensitive' } },
          }),
          ...(statusEnum && { status: statusEnum }),
        },
      });

      return {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        data: orders,
      };
    } catch (error: any) {
      throw new Error(`Error searching orders: ${error.message}`);
    }
  },

  // Get an order by ID
  getOrderById: async (id: number) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          buyer: true,
          payment: true,
          orderProducts: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) throw new Error('Order not found');
      return order;
    } catch (error: any) {
      console.error(error);
      throw new Error(`Error fetching order: ${error.message}`);
    }
  },

  // Get all orders by a user
  getOrdersByUser: async (userId: number, page: number, limit: number, order: string) => {
    try {
      const skip = (page - 1) * limit;

      // Total de órdenes para el usuario
      const totalOrders = await prisma.order.count({
        where: { userId },
      });

      // Obtener las órdenes con paginación
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          buyer: true,
          orderProducts: {
            include: {
              product: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: order as 'asc' | 'desc' },
      });

      // Calcular el total de páginas
      const totalPages = Math.ceil(totalOrders / limit);

      return {
        totalPages,
        currentPage: page,
        totalOrders,
        orders,
      };
    } catch (error: any) {
      console.error(error);
      throw new Error(`Error fetching orders for user ${userId}: ${error.message}`);
    }
  },

  // Update order
  updateOrder: async (orderId: number, data: Partial<Order>) => {
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data,
      });
      return updatedOrder;
    } catch (error: any) {
      console.error(error);
      throw new Error(`Error updating order status: ${error.message}`);
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: Status_Order) => {
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
      return updatedOrder;
    } catch (error: any) {
      console.error(error);
      throw new Error(`Error updating order status: ${error.message}`);
    }
  },

  getAllOrderMetrics: async () => {
    const totalOrders = await prisma.order.count();

    const pendingOrders = await prisma.order.aggregate({
      where: { status: 'PENDING' },
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    const completedOrders = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    const cancelledOrders = await prisma.order.aggregate({
      where: { status: 'CANCELLED' },
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    const totalAmount = (pendingOrders._sum.totalAmount || 0) + (completedOrders._sum.totalAmount || 0);

    return {
      totalOrders,
      ordersByStatus: {
        PENDING: {
          count: pendingOrders._count._all,
          totalAmountPending: Number(pendingOrders._sum.totalAmount?.toFixed(2)) || 0,
        },
        COMPLETED: {
          count: completedOrders._count._all,
          totalAmountCompleted: Number(completedOrders._sum.totalAmount?.toFixed(2)) || 0,
        },
        CANCELLED: {
          count: cancelledOrders._count._all,
          totalAmountCancelled: Number(cancelledOrders._sum.totalAmount?.toFixed(2)) || 0,
        },
      },
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  },

  getOrdersByUserWithFilters: async (
    order: string,
    limit: number = 10,
    page: number = 1,
    userId: number,
    status?: string,
    paymentType?: string
  ) => {
    try {
      const filters: any = { userId };

      if (status) {
        if (!Object.values(Status_Order).includes(status.toUpperCase() as Status_Order)) {
          throw new Error(`Invalid status: ${status}. Allowed values: ${Object.values(Status_Order).join(', ')}`);
        }
        filters.status = status.toUpperCase();
      }

      if (paymentType) {
        if (!Object.values(Payment_Order).includes(paymentType.toUpperCase() as Payment_Order)) {
          throw new Error(
            `Invalid payment type: ${paymentType}. Allowed values: ${Object.values(Payment_Order).join(', ')}`
          );
        }
        filters.paymentType = paymentType.toUpperCase();
      }

      const pageSize = limit || 4;
      const skip = (page - 1) * pageSize;

      const [orders, totalOrders] = await prisma.$transaction([
        prisma.order.findMany({
          where: filters,
          include: {
            buyer: true,
            orderProducts: {
              include: {
                product: true,
              },
            },
          },
          skip,
          take: pageSize,
          orderBy: { createdAt: order as 'asc' | 'desc' },
        }),
        prisma.order.count({ where: filters }),
      ]);

      const totalPages = Math.ceil(totalOrders / pageSize);

      return {
        pagination: {
          totalOrders,
          totalPages,
          currentPage: page,
          limit: pageSize,
        },
        orders,
      };
    } catch (error: any) {
      console.error(error);
      throw new Error(`Error fetching orders for user ${userId} with filters: ${error.message}`);
    }
  },
};
