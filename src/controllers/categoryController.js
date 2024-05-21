import {
  getParentCategories,
  getChildCategories,
} from '../models/CategoryModel.js';

export const getAllCategories = async (req, res) => {
  try {
    const parentCategories = await getParentCategories();
    const childCategories = await getChildCategories();

    const categories = parentCategories.map((parent) => ({
      ...parent,
      children: childCategories.filter(
        (child) => child.parent_id === parent.id,
      ),
    }));

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};
