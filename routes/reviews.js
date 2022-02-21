const express = require('express');
const asyncMiddleware = require('../middleware/error');
const { Review, validateReview } = require('../models/review');
const { Product } = require('../models/product');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const router = express.Router();

router.get('/:id', asyncMiddleware(async(req, res, next)=>{
    const product = await Product.findById(req.params._id);
    if(!product){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'No Product with this id', true);
    }
    const result = await Review.find({product: id});
    res.send({'reviews': result})
}));

router.post('/', asyncMiddleware(async(req, res, next)=>{
    const { error } = validateReview(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const product = await Product.findById(req.body.product);
    if(!product){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'No Product With Given Id', true);
    }

    const review = new Review(req.body);
    await review.save();
    res.send({'message': 'Review Created Successfully'});
}));

router.delete('/:id', asyncMiddleware(async(req, res, next)=>{
    const review = await Review.findByIdAndRemove(req.params.id);
    if(!review){
        throw new ApiError('Invalid data', HttpStatusCode.BAD_REQUEST, 'Invalid Id', true);
    }
    res.json({'message': 'Review Deleted Successfully'});
}));

module.exports = router;