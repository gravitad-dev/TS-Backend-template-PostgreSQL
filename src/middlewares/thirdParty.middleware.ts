import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Application } from 'express';
import * as rfs from 'rotating-file-stream';
import path from 'path';
import fs from 'fs';

const logsDirectory = path.join(__dirname, '../modules', 'logs');
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  size: '10M',
  path: logsDirectory,
  maxFiles: 7,
});

const errorLogStream = rfs.createStream('error.log', {
  interval: '1d',
  size: '10M',
  path: logsDirectory,
  maxFiles: 7,
});

export const thirdPartyMiddlewares = (app: Application): void => {
  const morganFormat =
    'IP: :remote-addr | Date: :date[clf] | Method: :method | URL: :url | Status: :status | Content-Length: :res[content-length] bytes | Response-Time: :response-time ms';

  app.use(limiter);

  app.use(
    morgan(morganFormat, {
      stream: accessLogStream,
      skip: (req, res) => req.method === 'OPTIONS' || res.statusCode >= 400,
    })
  );

  app.use(
    morgan(morganFormat, {
      stream: errorLogStream,
      skip: (_req, res) => res.statusCode < 400,
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  );

  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',');
  console.log('Allowed Origins:', allowedOrigins);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins?.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.status(204).send();
      return;
    }
    next();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};
