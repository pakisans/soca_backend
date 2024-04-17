import express from 'express';
import articlesRoutes from './src/routes/articlesRoutes.js';
import errorHandler from './src/middlewares/errorHandler.js';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/api', articlesRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
