import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const suggestedService = {
    async getAllSuggestions(page: number, limit: number) {
        const totalSuggestions = await prisma.suggested.count();
    
        const skip = (page - 1) * limit;
    
        const suggestions = await prisma.suggested.findMany({
          skip,
          take: limit,
          include: {
            articlesSuggested: true,
            productsSuggested: true,
            user: true,
          },
        });
    
        const totalPages = Math.ceil(totalSuggestions / limit);
    
        return {
          totalSuggestions,
          totalPages,
          currentPage: page,
          limitPerPage: limit,
          suggestions,
        };
    },

    async getSuggestionsById(id: number, type: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const userSuggested = await prisma.suggested.findUnique({
            where: { userId: id },
            include: {
              articlesSuggested: true,
              productsSuggested: true
            }
          });
    
          if (!userSuggested) {
            return [];
          }
    
        if (type === 'articles') {
            const suggestedArticles = await prisma.suggested.findUnique({
                where: { id },
                include: {
                    articlesSuggested: {
                        select: {
                            id: true,
                            title: true,
                            summary: true,
                            coverImage: true,
                        },
                        skip, 
                        take: limit, 
                    },
                },
            });
    
            return suggestedArticles?.articlesSuggested || [];
        }
    
        if (type === 'products') {
            const suggestedProducts = await prisma.suggested.findUnique({
                where: { id },
                include: {
                    productsSuggested: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            regularPrice: true,
                            offerPrice: true,
                        },
                        skip, 
                        take: limit, 
                    },
                },
            });
    
            return suggestedProducts?.productsSuggested || [];
        }
    
        return [];
    },

    async createSuggested(userId: number) {
        const existingSuggestion = await prisma.suggested.findUnique({
            where: { userId },
        });
        
        if (existingSuggestion) {
            return {message: 'A suggestion already exists for this user.' }
        }

        return prisma.suggested.create({
            data: {
                userId,
            },
        });
    },

    async updateSuggestedEntity(userId: number, id: string, type: string) {
        try {
          if (type !== 'article' && type !== 'product') {
            return { success: false, statusCode: 400, message: 'Invalid type. Use "article" or "product".' };
          }
    
          const userSuggested = await prisma.suggested.findUnique({
            where: { userId: userId },
            include: {
              articlesSuggested: true,
              productsSuggested: true
            }
          });
    
          if (!userSuggested) {
            return { success: false, statusCode: 404, message: 'Suggested not found for this user.' };
          }
    
          if (type === 'article') {
            const article = await prisma.article.findUnique({
              where: { id: parseInt(id) }
            });
    
            if (!article) {
              return { success: false, statusCode: 404, message: 'Article not found.' };
            }
    
            if (userSuggested.articlesSuggested.some((a) => a.id === article.id)) {
              return { success: false, statusCode: 400, message: 'Article already suggested.' };
            }
    
            await prisma.suggested.update({
              where: { userId: userId },
              data: {
                articlesSuggested: {
                  connect: { id: article.id }
                }
              }
            });
    
            return { success: true, message: 'Article added to suggested.' };
          }
    
          if (type === 'product') {
            const product = await prisma.product.findUnique({
              where: { id: parseInt(id) }
            });
    
            if (!product) {
              return { success: false, statusCode: 404, message: 'Product not found.' };
            }
    
            if (userSuggested.productsSuggested.some((p) => p.id === product.id)) {
              return { success: false, statusCode: 400, message: 'Product already suggested.' };
            }
    
            await prisma.suggested.update({
              where: { userId: userId },
              data: {
                productsSuggested: {
                  connect: { id: product.id }
                }
              }
            });
    
            return { success: true, message: 'Product added to suggested.' };
          }
    
          return { success: false, statusCode: 400, message: 'Invalid type. Use "article" or "product".' };
        } catch (error) {
          console.error(error);
          return { success: false, statusCode: 500, message: 'Internal server error.' };
        }
      },

    async deleteSuggested(id: number) {
        return prisma.suggested.delete({
        where: { id },
        });
    },
};
