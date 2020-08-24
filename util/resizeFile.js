const sharp = require('sharp');
const deleteFile=require('./deleteFile');
const resizeFile = (imageUrl) => {

    const modImageUrl = imageUrl + '.jpeg';

    sharp(imageUrl)
        .resize(640, 480)
        .jpeg({
            quality: 80,
            chromaSubsampling: '4:4:4'
        })
        .toFile(modImageUrl, (err, info) => {
            if (err) {
                console.log(err);
                const error = new Error('Resize image failed');
                error.statusCode = 500;
                throw error;
            }
            else {
                deleteFile(imageUrl);
            }
        })

}

module.exports=resizeFile;