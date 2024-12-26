import { PrismaClient, Buyer as BuyerType } from '@prisma/client';

const prisma = new PrismaClient();

export const buyerService = {
  async createBuyer(data: {
    name: string;
    email: string;
    addressBuyer?: string;
    phoneNumber?: string;
    companyName?: string;
    country: string;
    city: string;
    zipCode: string;
    notes?: string;
  }) {
    return prisma.buyer.create({
      data: {
        ...data,
        addressBuyer: data.addressBuyer || 'Address not specified',
        phoneNumber: data.phoneNumber || null,
        companyName: data.companyName || null,
        notes: data.notes || 'No additional notes',
      },
    });
  },
  async getAllBuyers() {
    return prisma.buyer.findMany();
  },
  async getBuyerById(id: number) {
    const buyerExists = await prisma.buyer.findUnique({ where: { id } });

    if (!buyerExists) {
      throw Object.assign(new Error(`No buyer was found with the ID ${id}`), { status: 404 });
    }
    return buyerExists;
  },
  async updateBuyer(id: number, data: Partial<Omit<BuyerType, 'id'>>) {
    const buyerExists = await prisma.buyer.findUnique({ where: { id } });

    if (!buyerExists) {
      throw Object.assign(new Error(`No buyer was found with the ID ${id}`), { status: 404 });
    }

    return prisma.buyer.update({
      where: { id },
      data,
    });
  },
  async deleteBuyer(id: number) {
    const buyerExists = await prisma.buyer.findUnique({ where: { id } });

    if (!buyerExists) {
      throw Object.assign(new Error(`No buyer was found with the ID ${id}`), { status: 404 });
    }

    return prisma.buyer.delete({ where: { id } });
  },
};
