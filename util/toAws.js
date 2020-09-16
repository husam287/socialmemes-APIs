const aws = require('aws-sdk');
const errorFunction = require('../util/errorFunction');
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
});

const upload = ()=>{
    const filename=req.file.originalname.split('.')[0];
    const filetype=req.file.originalname.split('.')[1];

    const params={
        Bucket:process.env.AWS_BUCKETNAME,
        Key:`${filename}-${new Date().getTime()}.${filetype}`,
        Body:req.file.buffer
    }

    s3.upload(params,(err,data)=>{
        if(err) throw  errorFunction('upload faild',500);
        req.file.path=data.Location;
        console.log(req.file.path);
    })
}

module.exports = upload;
    