const express = require('express');
const stripe = require('stripe')('sk_test_51KKkUVHYxjanX8wZ3gRfBeuGaLuOBJo2HsFtzsXX1mfxTiRsbHCfaWkQ41iDCS4xFm5JmwIHP3g0WUovfH4atASs00muIgCxQj');
const { Order, validateOrder} = require('../models/order');
const auth = require('../middleware/auth');
const asyncMiddleware = require('../middleware/error');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const { Product } = require('../models/product');
const { User } = require('../models/user');
const { Notification } = require('../models/notification');
const logger = require('../middleware/logger');
const socket = require('../socket');
const router = express.Router();

router.get('/', asyncMiddleware(async(req, res, next)=>{
    const result = await Order.find().populate('products.product user', '-password -__v -_id').select('-__v');
    res.send(result);
}));

router.get('/user/orders', auth, asyncMiddleware(async(req, res, next)=>{
    const user = await User.findById(req.user._id);
    console.log(req.user);
    if(!user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'Please Login Again', true);
    }
    const orders = await Order.find({user: req.user._id}).populate('products.product address', '-_id -__v').select('-user -__v');
    res.send({"orders": orders});
}));

router.post('/', auth, asyncMiddleware(async(req, res, next)=>{
    var price = 0;
    const stripeToken = req.body.stripeToken;
    const { error } = validateOrder(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const order = new Order(req.body);
    for (const prod of req.body.products) {
        const product = await Product.findById(prod.product);
        if(!product){
            throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, "No Product With the Given Id", true);
        }else if(product.numberInStock <= 0){
            product.stockStatus = "outOfStock";
            await product.save();
            throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, "This Product is Out of Stock", true);
        }else if(prod.count > product.numberInStock){
            throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, "There is no enough Products for your Order in Stock", true);
        }
        price = price + (product.price * prod.count);
        product.numberInStock = product.numberInStock -prod.count;
        await product.save();
    }
    order.user = req.user._id;
    order.price = price;
    const priceInPence = price * 100;
    const stripeCheckout = await stripe.charges.create({
        amount: priceInPence,
        currency: 'usd',
        source: stripeToken,
        capture: false,
     });
     console.log(req.user._id);
     socket.getIo().emit('notifications', {action: 'Create', message: 'Order Created Successfully'});
    const notification = new Notification({
        title: 'Order to be Created',
        content: 'Order No#111 is Created Successfully',
        user: req.user._id
    });
    console.log('notification', notification)
    await notification.save();
    const result = await order.save();
    
    res.send(order);
}));

router.get('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const order = await Order.findById(req.params.id).populate('products.product user', '-__v -password').select('-__v');
    if(req.user._id != order.user._id){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, "This Order is not yours", true);
    }
    if(!order){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, "No Order With the given Id", true);
    }

    res.send(order);
    logger.logger.log('error', 'Error ya Man');
}));

router.delete('/:id', asyncMiddleware(async(req, res, next)=>{
    const order = await Order.findByIdAndRemove(req.params.id);
    if(!order){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, "No Order With the given Id", true);
    }

    res.json({"message": "Order Deleted Successfully"});
}));

module.exports = router;