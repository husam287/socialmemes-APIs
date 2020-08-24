const multer = require('multer');
const fs = require('fs');

//##### upload dn take type input to make it a file in the saving dir #####
const upload = (type) => {

    //##### multer filestorage to adjust distination #####
    const fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            var stat = null;
            var dist = 'images/users/' + req.userId;

            //first check for the exist of userId file
            try {
                stat = fs.statSync(dist);
            }
            catch (err) {
                fs.mkdirSync(dist);
            }
            //Second check for the exist of type file
            stat = null;
            dist = 'images/users/' + req.userId + '/' + type;
            try {
                stat = fs.statSync(dist);
            }
            catch (err) {
                fs.mkdirSync(dist);
            }

            cb(null, dist);
        },
        filename: (req, file, cb) => {
            cb(null,
            file.originalname.split('.')[0] 
            + '-'
            + new Date().toISOString().replace(/:/g, '-') /*use replace as dots make a problem in filename*/ 
            + '.' + file.originalname.split('.')[1]);
        }
    });

    //##### block any other type of images #####
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/gif') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    };

    //##### main upload file #####
    return multer({ storage: fileStorage, fileFilter: fileFilter }).single('image');

}

module.exports = upload;

