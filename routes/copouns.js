const express = require('express');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const auth = require('../middleware/auth');
const asyncMiddleware = require('../middleware/error');
const{Copoun, validateCopoun} = require('../models/copoun');
const router = express.Router();

router.get('', asyncMiddleware(async(req, res, next)=>{
    const copouns = await Copoun.find().select('-__v');
    res.json({data: copouns});
}));

router.get('/:id', asyncMiddleware(async(req, res, next)=>{
    const copoun = await Copoun.findById(req.params.id);
    if(!copoun){
        throw new ApiError('Invalid Copoun', HttpStatusCode.BAD_REQUEST, 'No Copoun with The given Id', true);
    }
    
    res.json({data: copoun});
}));

router.post('', auth, asyncMiddleware(async(req, res, next)=>{
    const { error } = validateCopoun(req.body);
    if(error){
        throw new ApiError('Invalid Copoun', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const copoun = new Copoun(req.body);
    await copoun.save();
    res.json({data: copoun});
}));

router.put('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const {error} = validateCopoun(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }

    const copoun = await Copoun.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!copoun){
        throw new ApiError('Invalid Copoun', HttpStatusCode.BAD_REQUEST, 'No Such Copoun', true);
    }
    res.json({message: 'Copoun Updated Successfully'});
}));

router.delete('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const copoun = await Copoun.findByIdAndRemove(req.params.id);
    if(!copoun){
        throw new ApiError('Invalid Copoun', HttpStatusCode.BAD_REQUEST, 'No Such Copoun', true);
    }

    res.json({message: 'Copoun Deleted Successfully'});
}));

module.exports = router;
