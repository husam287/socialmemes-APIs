const sharp = require('sharp');
const deleteFile=require('./deleteFile');
const resizeFile = (imageBuffer) => {


    sharp(imageBuffer)
        .resize(null, 480)
        .jpeg({
            quality: 80,
            chromaSubsampling: '4:4:4'
        })
        .toBuffer((err,buffer, info) => {
            if (err) {
                console.log(err);
                const error = new Error('Resize image failed');
                error.statusCode = 500;
                throw error;
            }
            else {
                return buffer;
            }
        })

}

module.exports=resizeFile;