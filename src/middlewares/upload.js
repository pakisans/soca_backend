import multer from 'multer';
import os from 'os';

export const uploadReportFiles = multer({ dest: os.tmpdir() }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);
