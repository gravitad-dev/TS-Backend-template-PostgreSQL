import { PrismaClient, Status_Article, Article } from '@prisma/client';
import { articleSelect } from './articleSelect';

const prisma = new PrismaClient();

interface SearchArticlesParams {
  title?: string;
  categoryId?: number;
  status?: string;
  authorId?: number;
}

export const createArticle = async (data: Article): Promise<Partial<Article>> => {
  try {
    const article = await prisma.article.create({
      data: {
        ...data,
      },
      select: articleSelect,
    });

    return article as unknown as Partial<Article>;
  } catch (error: any) {
    console.error(error);
    throw new Error('Failed to create article: ' + error.message);
  }
};

export const getArticles = async (limit: number, skip: number, searchTerm: string): Promise<Partial<Article>[]> => {
  try {
    const articles = await prisma.article.findMany({
      skip,
      take: limit,
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return articles as unknown as Partial<Article>[];
  } catch (error) {
    throw new Error('Failed to fetch articles');
  }
};

export const countArticles = async (searchTerm: string): Promise<number> => {
  try {
    const totalArticles = await prisma.article.count({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    });
    return totalArticles;
  } catch (error) {
    throw new Error('Failed to count articles');
  }
};

export const count = async (): Promise<number> => {
  try {
    const totalArticles = await prisma.article.count();
    return totalArticles;
  } catch (error) {
    throw new Error('Failed to count articles');
  }
};

export const getArticlesPublished = async (limit: number, skip: number): Promise<Partial<Article>[]> => {
  try {
    const articles = await prisma.article.findMany({
      skip,
      take: limit,
      where: {
        status: Status_Article.PUBLISHED,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return articles as unknown as Partial<Article>[];
  } catch (error) {
    throw new Error('Failed to fetch articles');
  }
};

export const countArticlesPublished = async (): Promise<number> => {
  try {
    const totalArticles = await prisma.article.count({
      where: {
        status: Status_Article.PUBLISHED,
      },
    });
    return totalArticles;
  } catch (error) {
    throw new Error('Failed to count articles');
  }
};

export const getArticlesByUserId = async (userId: number, limit: number, skip: number) => {
  try {
    const userWithArticles = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        articles: {
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
        },
      },
    });

    if (!userWithArticles) {
      throw new Error('User not found');
    }

    const published = userWithArticles.articles.filter((article) => article.status === 'PUBLISHED');
    const draft = userWithArticles.articles.filter((article) => article.status === 'DRAFT');

    return {
      user: { id: userWithArticles.id, username: userWithArticles.username, email: userWithArticles.email },
      published,
      draft,
    };
  } catch (error) {
    throw new Error('Failed to fetch articles for the specified user');
  }
};

export const getArticleById = async (id: number): Promise<Partial<Article> | null> => {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });
    return article as Partial<Article> | null;
  } catch (error) {
    throw new Error('Failed to fetch article by ID');
  }
};

export const getArticleByUrl = async (url: string): Promise<Partial<Article> | null> => {
  try {
    const article = await prisma.article.findUnique({
      where: { url },
      select: articleSelect,
    });
    return article as Partial<Article> | null;
  } catch (error) {
    throw new Error('Failed to fetch article by URL');
  }
};

export const updateArticle = async (id: number, data: Partial<Article>): Promise<Partial<Article>> => {
  try {
    const updateData: any = {
      title: data.title,
      summary: data.summary,
      coverImage: data.coverImage,
      content: data.content,
      status: data.status,
      url: data.url,
      author: data.authorId ? { connect: { id: data.authorId } } : undefined,
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      scheduledAt: data.scheduledAt,
    };

    await prisma.article.update({
      where: { id },
      data: updateData,
      select: articleSelect,
    });

    const updatedArticle = await getArticleById(id);
    return updatedArticle as Partial<Article>;
  } catch (error) {
    throw new Error('Failed to update article');
  }
};

export const deleteArticle = async (id: number): Promise<Partial<Article>> => {
  try {
    const article = await prisma.article.delete({
      where: { id },
      select: articleSelect,
    });
    return article as unknown as Partial<Article>;
  } catch (error) {
    throw new Error('Failed to delete article');
  }
};

interface SearchArticlesParams {
  title?: string;
  status?: string;
  authorId?: number;
  category?: string;
  order: string;
  limit: number;
  skip: number;
}

export const searchArticles = async (params: SearchArticlesParams) => {
  try {
    const { title, status, authorId, category, limit, skip, order } = params;

    let statusEnum: Status_Article | undefined;
    if (status === 'PUBLISHED' || status === 'DRAFT') {
      statusEnum = status as Status_Article;
    }

    let categoryId: number | undefined;
    if (category) {
      const categoryRecord = await prisma.category.findFirst({
        where: {
          name: {
            contains: category.toLowerCase(),
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });

      if (categoryRecord) {
        categoryId = categoryRecord.id;
      }
    }

    // Realizar la consulta en Prisma
    const articles = await prisma.article.findMany({
      where: {
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        status: statusEnum,
        authorId,
        categoryId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: order === 'asc' ? 'asc' : 'desc',
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            image: true,
            phone: true,
            role: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return articles;
  } catch (error) {
    throw new Error('Failed to search articles');
  }
};

export const countArticlesFiltered = async (params: Omit<SearchArticlesParams, 'limit' | 'skip'>): Promise<number> => {
  try {
    const { title, status, authorId, category, order } = params;

    let statusEnum: Status_Article | undefined;
    if (status === 'PUBLISHED' || status === 'DRAFT') {
      statusEnum = status as Status_Article;
    }

    let categoryId: number | undefined;
    if (category) {
      const categoryRecord = await prisma.category.findFirst({
        where: {
          name: {
            contains: category?.toLowerCase(),
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });

      if (categoryRecord) {
        categoryId = categoryRecord.id;
      }
    }

    const totalCount = await prisma.article.count({
      where: {
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        status: statusEnum,
        authorId,
        categoryId,
      },
    });

    return totalCount;
  } catch (error) {
    throw new Error('Failed to count articles');
  }
};

export const findArticlesByCategory = async (categoryId: number) => {
  const articles = await prisma.article.findMany({
    where: { categoryId: categoryId, status: Status_Article.PUBLISHED },
    take: 7,
    select: {
      id: true,
      createdAt: true,
      title: true,
      summary: true,
      coverImage: true,
      categoryId: true,
    },
  });

  if (articles.length < 7) {
    const remainingCount = 7 - articles.length;
    const additionalArticles = await prisma.article.findMany({
      where: {
        categoryId: { not: categoryId },
        status: Status_Article.PUBLISHED,
      },
      take: remainingCount,
      select: {
        id: true,
        createdAt: true,
        title: true,
        summary: true,
        coverImage: true,
        categoryId: true,
      },
    });
    articles.push(...additionalArticles.sort(() => Math.random() - 0.5));
  }

  return articles.slice(0, 7);
};
