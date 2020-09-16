const aws = require('aws-sdk');
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,

})


module.exports=(url)=>{

    const filename=url.toString().split('.com/')[1];
    console.log(filename);
    const params={
        Bucket:process.env.AWS_BUCKETNAME,
        Key: filename
    }
    
    return new Promise((resolve,reject)=>{
        s3.deleteObject(params,(err,data)=>{
            if(err){
                reject('faild');
            }
            else{
                resolve('Deleted successfully!!')
            }
         })
    })  
    
}