import multer from "multer";
import * as path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    let filename =
      file.originalname.split(path.extname(file.originalname))[0] +
      "-" +
      Date.now() +
      path.extname(file.originalname);
    cb(null, filename);
  },
});

export const upload = multer({ storage })