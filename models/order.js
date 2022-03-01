const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {Product} = require('./product');
const {User} = require('./user');
const orderSchema = new mongoose.Schema({
    products:[{
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
        },
        count: {
            type: Number,
            required: true
        }
    }],
    orderDate:{
        type: Date,
        required: true,
        default: Date.now()
    },
    price:{
        type: Number
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    status:{
        type: String,
        default: 'New'
    },
    stripeToken: {
        type: String,
        required: true
    },
    paymentMethod:{
        type: String,
        required: true,
        enum:['cod', 'online']
    }
});

const Order = mongoose.model('Order', orderSchema);

function validateOrder(order){
    const schema = Joi.object({
        products: Joi.array().items(
            Joi.object({
                product: Joi.objectId().required(),
                count: Joi.number()
            })
        ),
        user: Joi.objectId(),
        address: Joi.objectId().required(),
        stripeToken: Joi.string().required(),
        status: Joi.string(),
        paymentMethod: Joi.string().required().valid('cod','online')
    });

    return schema.validate(order);
}

module.exports.Order = Order;
module.exports.validateOrder = validateOrder;