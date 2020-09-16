const multer = require("multer");

const storage =multer.memoryStorage({
    destination: (req,file,cb)=>{
        cb(null,'');
    }
})

const upload=multer({storage:storage}).single('image');

module.exports=upload;