import multer from 'multer';
import path from 'path';
import slugifyString from './slugify.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let filePath;
    if (file.fieldname === 'topic-image') {
      filePath = path.join(process.cwd(), 'uploads', 'images', 'topics');
    } else {
      filePath = path.join(process.cwd(), 'uploads');
    }
    cb(null, filePath);
  },
  filename: (req, file, cb) => {
    let fileName;
    if (file.fieldname === 'topic-image') {
      fileName = slugifyString(req.body.title + path.extname(file.originalname));
    } else {
      fileName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    }

    cb(null, fileName);
  },
});

const upload = multer({ storage });

export default upload;
