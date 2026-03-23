import { findAllCategoriesWithGroups } from './categories.repository.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await findAllCategoriesWithGroups();
  res.json(categories);
});
