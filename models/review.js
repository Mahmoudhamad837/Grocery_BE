const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const reviewSchema = new mongoose.Schema({
    rating: {
        type: String,
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
    publicName:{
        type: String,
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
        rating: Joi.string().required(),
        title: Joi.string().required(),
        review: Joi.string().required(),
        publicName: Joi.string().required(),
        product: Joi.objectId().required()
    });

    return Schema.validate(review);
}

module.exports.Review = Review;
module.exports.validateReview = validateReview;