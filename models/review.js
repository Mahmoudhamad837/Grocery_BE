const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    review: {
        type: String,
        maxlength: 255,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
});

const Review = mongoose.model('Review', reviewSchema);

function validateReview(review){
    const Schema = Joi.object({
        rating: Joi.number().required(),
        title: Joi.string().required(),
        review: Joi.string().required(),
        user: Joi.objectId(),
        product: Joi.objectId().required()
    });

    return Schema.validate(review);
}

module.exports.Review = Review;
module.exports.validateReview = validateReview;