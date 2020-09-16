const aws = require('aws-sdk');
const errorFunction = require('../util/errorFunction');
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
});

const upload = (req)=>{
    const numberOfName=req.file.originalname.split('.');
    const filename=req.file.originalname.split('.')[0];
    const filetype=req.file.originalname.split('.')[numberOfName.length-1];

    const params={
        Bucket:process.env.AWS_BUCKETNAME,
        Key:`${filename}-${new Date().getTime()}.${filetype}`,
        Body:req.file.buffer
    }

    return s3.upload(params).promise();
}

module.exports = upload;
    