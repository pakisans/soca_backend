import express from 'express';
import articlesRoutes from './src/routes/articlesRoutes.js';
import mailRoutes from './src/routes/mailRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import errorHandler from './src/middlewares/errorHandler.js';
import morgan from 'morgan';
import cors from 'cors';
import { __dirname } from './src/config/dirname.js';
import path from 'path';
import { requestLogger } from './src/config/logger.js';

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
};

const app = express();
const port = process.env.PORT || 3001;

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.json());
app.use(requestLogger);
app.use(morgan('dev'));
app.use(cors(corsOptions));

app.use('/api', articlesRoutes);
app.use('/api', mailRoutes);
app.use('/api', categoryRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
