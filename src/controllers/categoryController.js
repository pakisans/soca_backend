import { getAllCategoriesWithGroups } from '../models/CategoryModel.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesWithGroups();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};
