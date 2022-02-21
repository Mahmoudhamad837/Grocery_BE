const express = require('express');
const { Address, validateAddress } = require('../models/address');
const auth = require('../middleware/auth');
const asyncMiddleware = require('../middleware/error');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');

const router = express.Router();

router.get('/', auth, asyncMiddleware(async(req, res, next)=>{
    const result = await Address.find({user: req.user._id});
    res.json({'address': result});
}));

router.get('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const address = await Address.findById(req.params.id);
    if(!address){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Invalid Id', true);
    }
    res.json({"address": address});
}));

router.post('/', auth, asyncMiddleware(async(req, res, next)=>{
    const { error } = validateAddress(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const address = new Address(req.body);
    address.user = req.user._id;
    const result = await address.save();
    res.json({"message": "Address Created Successfully"});
}));

router.put('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const { error } = validateAddress(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }

    const address = await Address.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!address){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Not a Valid Id', true);
    }

    res.json({"message": "Address Updated Successfully"});
}));

router.delete('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const address = await Address.findByIdAndRemove(req.params.id);
    if(!address){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Not a Valid Id', true);
    }

    res.json({"message": "Address Deleted Successfully"});
}));

module.exports = router;