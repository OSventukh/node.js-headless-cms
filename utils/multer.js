import multer from 'multer';
import path from 'path';
import fs from 'fs';
import slugifyString from './slugify.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolder = path.join(process.cwd(), 'uploads');
    const imagesFolder = path.join(uploadFolder, 'images');
    // create uploads/images folders if not exist
    fs.mkdirSync(uploadFolder, { recursive: true });
    fs.mkdirSync(imagesFolder, { recursive: true });
    let filePath;

    if (file.fieldname === 'topic-image') {
      const topicImages = path.join(imagesFolder, 'topics');
      // create folder upload/images/topics if not exist
      fs.mkdirSync(topicImages, { recursive: true });
      filePath = topicImages;
    } else if (file.fieldname === 'post-image') {
      const postImages = path.join(imagesFolder, 'posts');
      // create folder upload/images/posts if not exist
      fs.mkdirSync(postImages, { recursive: true });
      const dateFolder = path.join(postImages, new Date().toISOString().slice(0, 10))
      // create folder upload/images/[yyyy-mm-dd] if not exist
      fs.mkdirSync(dateFolder, { recursive: true });
      filePath = dateFolder;
    } else {
      filePath = imagesFolder;
    }
    cb(null, filePath);
  },
  filename: (req, file, cb) => {
    let fileName;
    if (file.fieldname === 'topic-image') {
      fileName = slugifyString(
        req.body.title + path.extname(file.originalname)
      );
    } else {
      fileName = `${file.fieldname}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
    }

    cb(null, fileName);
  },
});

const upload = multer({ storage });

export default upload;
