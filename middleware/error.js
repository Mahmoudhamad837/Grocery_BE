function asyncMiddleware(handler){
    return async(req, res, next)=>{
        try{
            await handler(req, res);
            next();
        }catch(ex){
           return res.status(ex.httpStatusCode || 500).send({'error': ex.message});
        }
    }
}

module.exports = asyncMiddleware;