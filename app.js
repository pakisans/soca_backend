import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from './src/config/index.js';
import { requestLogger } from './src/config/logger.js';
import errorHandler from './src/middlewares/errorHandler.js';

import articlesRoutes from './src/modules/articles/articles.routes.js';
import categoriesRoutes from './src/modules/categories/categories.routes.js';
import manufacturersRoutes from './src/modules/manufacturers/manufacturers.routes.js';
import mailRoutes from './src/modules/mail/mail.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(helmet());

app.use('/images', express.static(join(__dirname, 'images')));

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(cors({ origin: config.cors.origin, optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(requestLogger);

app.use('/api-v2', apiLimiter);
app.use('/api-v2', articlesRoutes);
app.use('/api-v2', categoriesRoutes);
app.use('/api-v2', manufacturersRoutes);
app.use('/api-v2', mailRoutes);

app.use(errorHandler);

export default app;
