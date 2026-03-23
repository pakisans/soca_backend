import { findAllManufacturers } from './manufacturers.repository.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const getAllManufacturers = asyncHandler(async (req, res) => {
  const manufacturers = await findAllManufacturers();
  res.json(manufacturers);
});
