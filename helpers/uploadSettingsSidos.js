const multer = require("multer");

const uploadSettingsSidos = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "download_file/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
    limits: {
      fileSize: 200000,
    },
  });

  const upload = multer({ storage: storage });
  return upload;
};

module.exports = uploadSettingsSidos;
