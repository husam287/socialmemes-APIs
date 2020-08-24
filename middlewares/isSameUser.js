module.exports = (req, res, next) => {
    //##### reject if he is not the user #####
    if (req.userId.toString() !== req.params.userId.toString()) {
        const error = new Error("You've no permissions")
        error.statusCode = 403;
        throw error;
    }
    next()
}