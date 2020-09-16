const errorFunction = require('../util/errorFunction');
const toAws=require('../util/toAws')


module.exports=(req,res,next)=>{

    if(!req.file) {
        next();
        return;
    }
    toAws(req)
    .then(data=>{
        req.file.path=data.Location;
        next()
    })
    .catch(err=>{
        throw errorFunction('upload faild',500);
    })
}