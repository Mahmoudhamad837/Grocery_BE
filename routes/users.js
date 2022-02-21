const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const auth = require('../middleware/auth');
const {User, validateUser} = require('../models/user');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const asyncMiddleware = require('../middleware/error');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', asyncMiddleware(async(req, res, next)=>{
    const users = await User.find().select('-password -__v');
    res.json({"data": users});
}));

router.get('/:id', asyncMiddleware(async(req, res, next)=>{
    const user = await User.findById(req.params.id).select('-password -__v');
    if(!user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'No User With the given Id', true)
    }

    res.json({"data": user});
}));

router.use('/delivery/boys', asyncMiddleware(async(req, res, next)=>{
    const deliveryBoys = await User.find({role: 'delivery_boy'}).select('-password -__v');
    res.json({data: deliveryBoys}); 
}));

router.post('/', auth, upload.single('image'), asyncMiddleware(async(req, res, next)=>{
    const {error} = validateUser(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    let user = await User.findOne({email: req.body.email});
    if(user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'User with This Email Already Found', true);
    }

    if(!req.file){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Please Choose an Image', true);
    }
    const salt = await bcrypt.genSalt(10);
    user = new User(req.body);
    user.image = 'http://localhost:3000/' + req.file.filename;
    user.password = await bcrypt.hash(user.password, salt);
    const result = await user.save();
    res.send(_.pick(user, ['name', 'email', 'image']));
}));

router.put('/:id', auth, upload.single('image'), asyncMiddleware(async(req, res, next)=>{
    const { error } = validateUser(req.body);
    if(error){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    if(req.file){
        // throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Please Choose an Image', true);
        req.body.image = 'http://localhost:3000/' + req.file.filename;
    }

    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'No User With the given Id', true);
    }
    res.send(user);
}));

router.delete('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const user = await User.findByIdAndRemove(req.params.id);
    if(!user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'No User With the given Id', true);
    }
    res.json({"message": "User Deleted Successfully"});
}));

module.exports = router;