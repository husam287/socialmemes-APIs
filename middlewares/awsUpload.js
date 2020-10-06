const multer = require("multer");



    const storage = multer.memoryStorage({
        destination: (req, file, cb) => {
            cb(null, '');
        }

    })

    //##### block any other type of images #####
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpeg') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    };

   

    
    
    
module.exports = multer({ storage: storage,fileFilter:fileFilter }).single('image');