import express from 'express';
import { privateRouter, publicRouter } from './routes';
import {
  errorMiddleware,
  authMiddleware,
  thirdPartyMiddlewares,
} from './middlewares';

const app = express();

thirdPartyMiddlewares(app);

app.use('/api', publicRouter);

app.use(authMiddleware);

app.use('/api', privateRouter);

app.use(errorMiddleware);

export default app;
