import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
    if (!/\.(png|jpeg|webp)$/i.test(file.originalname)) {
      return cb(new Error('Only .png, .jpeg, and .webp files are allowed'), false);
    }
    cb(null, true);
  };

export const upload =  multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { files: 4 },
  });