const jwt=require('jsonwebtoken')

module.exports=(req,res,next)=>{
    if(!req.get('Authorization')){
        const error =new Error('token is not define');
        error.statusCode=401;
        throw error;
    }
    
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token,'husam23214895')
    } catch (error) {
        error.statusCode=500;
        throw error;
    }
    if(!decodedToken){
        const error =new Error('Not Authorized');
        error.statusCode=401;
        throw error;
    }
    req.userId=decodedToken.userId;
    next();
}