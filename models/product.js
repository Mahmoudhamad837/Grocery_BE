const { number, boolean } = require('joi');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: mongoose.Schema({
        ar: {type: String, required: true},
        en: {type: String, required: true}
    }),
    description: mongoose.Schema({
        ar: {type: String, required: true},
        en: {type: String, required: true}
    }),
    image: {type: String, required: true},
    inStock:{type: Boolean, default: true},
    tax:{ type: Number, required: true},
    numberInStock: {type: Number, required: true},
    price:{type: Number, required: true},
    deliveryTime:{type: Date, require: true},
    featured:{type: Boolean, default: false},
    stockStatus:{type: String, required: true, enum:['inStock', 'outOfStock']},
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
});

const Product = mongoose.model('Product', productSchema);

function validateProduct(product){
    const Schema = Joi.object({
        title: Joi.object({
            ar: Joi.string().required(),
            en: Joi.string().required()
        }),
        description: Joi.object({
            ar: Joi.string().min(5).max(255).required(),
            en: Joi.string().min(5).max(255).required()
        }),
        image: Joi.string(),
        inStock: Joi.boolean(),
        tax: Joi.number().required(),
        numberInStock: Joi.number().required(),
        price: Joi.number().required(),
        deliveryTime: Joi.date().required(),
        stockStatus: Joi.string().required().valid('inStock', 'outOfStock'),
        category: Joi.objectId().required()
    });

    return Schema.validate(product);
}

module.exports.Product = Product;
module.exports.validateProduct = validateProduct;