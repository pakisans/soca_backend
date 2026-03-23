import { AppError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';

export default function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error(err.stack || err.message);

  return res.status(500).json({ message: 'Internal server error' });
}
