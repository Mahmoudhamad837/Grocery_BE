const jwt = require('jsonwebtoken');
function auth(req, res, next){
    if(!req.get('Authorization')){
        return res.status(401).json({error: 'Not Authenticated'});
    }
    const token = req.get('Authorization').split(' ')[1];
    if(!token){
        return res.status(401).send('Invalid Credentials'); 
    }

    try{
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        req.user = decoded;
        next();
    }catch(ex){
        res.status(400).send('Invalid Token');
    }
}

module.exports = auth;