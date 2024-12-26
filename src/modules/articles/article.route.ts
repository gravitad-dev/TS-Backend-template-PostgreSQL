import { Router } from 'express';
import * as articleController from './article.controller';
import { sanitizeMiddleware } from '../../middlewares';

const articlesPrivateRouter = Router();
const articlesPublicRouter = Router();

// PUBLICS ROUTES
articlesPublicRouter.get('/', articleController.getArticles);
articlesPublicRouter.get('/user', articleController.getUserArticles);
articlesPublicRouter.get('/search', articleController.searchArticle);
articlesPublicRouter.get('/:id', articleController.getArticleById);

// PRIVATE ROUTES
articlesPrivateRouter.get('/published', articleController.getUserArticlesPublished);
articlesPrivateRouter.post('/', sanitizeMiddleware, articleController.createArticle);
articlesPrivateRouter.put('/:id', sanitizeMiddleware, articleController.updateArticle);
articlesPrivateRouter.delete('/:id', articleController.deleteArticle);

export { articlesPublicRouter, articlesPrivateRouter };
