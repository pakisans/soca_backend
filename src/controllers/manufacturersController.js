import { getAllManufacturers } from '../models/manufactureModel.js';

export async function getAllManufacturersHandler(req, res) {
  try {
    const manufacturers = await getAllManufacturers();

    res.json(manufacturers);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    res.status(500).send({
      message: 'Error fetching manufacturers',
      error: error.message,
    });
  }
}
