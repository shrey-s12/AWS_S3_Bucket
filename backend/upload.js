const dotenv = require('dotenv');
dotenv.config();

const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('./s3');

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        key: (req, file, cb) => {
            cb(null, `uploads/${Date.now()}_${file.originalname}`);
        }
    })
});

module.exports = upload;
