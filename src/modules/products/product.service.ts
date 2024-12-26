import { PrismaClient, Status_Product, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

export const productService = {
  async createProduct(data: {
    name: string;
    regularPrice: number;
    offerPrice?: number;
    stock: number;
    image?: string;
    imageGallery?: string[];
    status?: Status_Product;
    productType: ProductType;
    categoryId?: number;
    scheduledAt?: Date;
    attributes?: object;
    content?: string;
    description?: string;
  }) {
    return await prisma.product.create({
      data: {
        ...data,
        image: data.image || 'default.jpg',
        imageGallery: data.imageGallery || [],
        attributes: data.attributes || {},
        categoryId: data.categoryId ?? null,
        offerPrice: data.offerPrice ?? null,
        scheduledAt: data.scheduledAt ?? null,
        status: data.status || Status_Product.DISABLED,
        productType: data.productType || ProductType.PHYSICAL,
        content: data.content || '',
        description: data.description || '',
      },
    });
  },

  async getAllProducts() {
    try {
      return await prisma.product.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  },

  async getPaginatedProducts(limit: number, skip: number) {
    return await prisma.product.findMany({
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async getCountProducts() {
    return await prisma.product.count();
  },

  async findProductsFiltered(
    filters: any,
    skip: number,
    take: number,
    sortBy: 'date' | 'price' = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const totalProducts = await prisma.product.count({
      where: filters.AND.length ? filters : undefined,
    });

    let orderBy: any[];

    if (sortBy === 'date') {
      orderBy = [{ createdAt: sortOrder }, { id: sortOrder }];
    } else {
      orderBy = [
        {
          offerPrice: sortOrder,
        },
        {
          regularPrice: sortOrder,
        },
        { id: sortOrder },
      ];
    }

    const products = await prisma.product.findMany({
      where: filters.AND.length ? filters : undefined,
      skip: skip,
      take: take,
      orderBy: orderBy,
    });

    return {
      products,
      totalProducts,
    };
  },

  async getProductById(id: number) {
    if (!id) return null;
    return await prisma.product.findUnique({ where: { id } });
  },

  async getProductByCategoryId(id: number) {
    if (!id) return null;
    return await prisma.product.findMany({ where: { categoryId: id } });
  },

  async updateProduct(
    id: number,
    data: Partial<{
      name: string;
      description?: string;
      regularPrice: number;
      offerPrice?: number;
      stock: number;
      image?: string;
      imageGallery?: string[];
      status?: Status_Product;
      categoryId?: number;
      scheduledAt?: Date;
      attributes?: object;
      content?: string;
      productType?: ProductType;
    }>
  ) {
    if (!id) return null;

    if (data.stock) {
      data.stock = Number(data.stock);
    }

    if (data.status) {
      data.status = data.status.toUpperCase() as Status_Product;
    }

    if (data.productType) {
      data.productType = data.productType.toUpperCase() as ProductType;
    }

    return await prisma.product.update({ where: { id }, data });
  },

  async deleteProduct(id: number) {
    if (!id) return null;
    const deletedProduct = await prisma.product.delete({ where: { id } });
    return {
      message: 'Product deleted successfully',
      product: deletedProduct,
    };
  },

  async SortedByDate(order: string) {
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    return await prisma.product.findMany({
      orderBy: {
        createdAt: sortOrder,
      },
    });
  },

  async findProductsByCategory(categoryId: number) {
    const products = await prisma.product.findMany({
      where: { categoryId, status: Status_Product.ACTIVE },
      take: 7,
      select: {
        id: true,
        image: true,
        regularPrice: true,
        offerPrice: true,
        name: true,
      },
    });

    if (products.length < 7) {
      const remainingCount = 7 - products.length;
      const additionalProducts = await prisma.product.findMany({
        where: {
          categoryId: { not: categoryId },
          status: Status_Product.ACTIVE,
        },
        take: remainingCount,
        select: {
          id: true,
          image: true,
          regularPrice: true,
          offerPrice: true,
          name: true,
        },
      });
      products.push(...additionalProducts.sort(() => Math.random() - 0.5));
    }

    return products.slice(0, 7);
  },

  async getRandomProducts() {
    const totalProducts = await prisma.product.count({
      where: { status: Status_Product.ACTIVE },
    });
    const skip = Math.max(0, Math.floor(Math.random() * totalProducts) - 1);

    const randomProducts = await prisma.product.findMany({
      where: { status: Status_Product.ACTIVE },
      take: totalProducts,
      skip: skip,
      select: {
        id: true,
        image: true,
        regularPrice: true,
        offerPrice: true,
        name: true,
      },
    });

    if (randomProducts.length < totalProducts) {
      const remainingCount = totalProducts - randomProducts.length;
      const additionalProducts = await prisma.product.findMany({
        where: { status: Status_Product.ACTIVE },
        take: remainingCount,
        select: {
          id: true,
          image: true,
          regularPrice: true,
          offerPrice: true,
          name: true,
        },
      });
      randomProducts.push(...additionalProducts);
    }

    return randomProducts.sort(() => Math.random() - 0.5).slice(0, 7);
  },
};
