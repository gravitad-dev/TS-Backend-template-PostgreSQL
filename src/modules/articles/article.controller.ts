import { Request, Response } from 'express';
import * as articleService from './article.service';
import { validateCreateArticle, validateUpdateArticle } from './article.validator';
import { Article } from '@prisma/client';

export const createArticle = async (req: Request, res: Response) => {
  const { error } = await validateCreateArticle(req.body);
  if (error) {
    res.status(400).json({ errors: error });
    return;
  }

  try {
    const articleData = req.body;
    articleData.authorId = req.user?.id;
    const newArticle = await articleService.createArticle(articleData);
    res.status(201).json(newArticle);
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  const { error } = validateUpdateArticle(req.body);

  if (error) {
    res.status(400).json({ errors: error });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const articleData = req.body;
    const updatedArticle = await articleService.updateArticle(id, articleData);
    res.status(200).json(updatedArticle);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = (req.query.searchTerm as string) || '';

    const articles = await articleService.getArticles(limit, skip, searchTerm);
    const totalArticles = await articleService.countArticles(searchTerm);

    res.status(200).json({
      totalArticles,
      totalPages: Math.ceil(totalArticles / limit),
      currentPage: page,
      articles,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserArticlesPublished = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const articles = await articleService.getArticlesPublished(limit, skip);
    const totalArticles = await articleService.countArticlesPublished();

    res.status(200).json({
      totalArticles,
      totalPages: Math.ceil(totalArticles / limit),
      currentPage: page,
      articles,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserArticles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const result = await articleService.getArticlesByUserId(parseInt(userId), limit, skip);
    if (!result) {
      res.status(404).json({ message: 'Articles not found' });
      return;
    }

    const totalArticles = result.published.length + result.draft.length;
    res.status(200).json({
      totalArticles,
      totalPages: Math.ceil(totalArticles / limit),
      currentPage: page,
      user: result.user,
      articles: {
        published: result.published,
        draft: result.draft,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const article = await articleService.getArticleById(id);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    const categoryId = Number(article?.categoryId);
    const recommended = await articleService.findArticlesByCategory(categoryId);
    const recommendedArticles = recommended.filter((e: Partial<Article>) => e.id !== article?.id);

    if (article) {
      res.status(200).json({ article, recommended: recommendedArticles });
      return;
    } else {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const existingArticle = await articleService.getArticleById(id);
    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    const deletedArticle = await articleService.deleteArticle(id);
    res.status(200).json({
      message: 'Article successfully deleted',
      article: deletedArticle,
    });
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const searchArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, status, authorId, category, page = 1, limit = 10, order } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const articles = await articleService.searchArticles({
      title: title?.toString(),
      status: status?.toString().toUpperCase(),
      authorId: authorId ? parseInt(authorId.toString()) : undefined,
      category: category?.toString(),
      limit: parseInt(limit as string),
      order: order?.toString() || 'desc',
      skip,
    });

    const articleCount = await articleService.countArticlesFiltered({
      title: title?.toString(),
      status: status?.toString().toUpperCase(),
      authorId: authorId ? parseInt(authorId.toString()) : undefined,
      category: category?.toString(),
      order: order?.toString() || 'desc',
    });

    const totalPages = Math.ceil(articleCount / parseInt(limit as string));

    if (articles.length > 0) {
      res.status(200).json({
        totalArticles: articleCount,
        totalPages,
        currentPage: Number(page),
        articles,
      });
    } else {
      res.status(404).json({ error: 'Articles not found' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
