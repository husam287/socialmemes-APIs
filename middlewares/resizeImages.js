const sharp = require('sharp');
const errorFunction = require('../util/errorFunction');

module.exports=(width=480)=>{
    return (req,res,next)=>{

        //Reject if req.file is not define
        if(!req.file) {
            return next();
            
        }

        sharp(req.file.buffer)
        .resize(null, width)
        .jpeg({
            quality: 80,
            chromaSubsampling: '4:4:4'
        })
        .withMetadata() //to keep the orientation of the images
        .toBuffer((err, buffer, info) => {
            if (err) {
                throw errorFunction('Resize image failed',500)
            }
            else {
                req.file.buffer = buffer
                next();
            }
        })

       
    }
}