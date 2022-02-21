const express = require('express');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const auth = require('../middleware/auth');
const asyncMiddleware = require('../middleware/error');
const { Notification, validateNotification } = require('../models/notification');
const { User } = require('../models/user');

const router = express.Router();

router.get('/', auth, asyncMiddleware(async(req, res, next)=>{
    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'Please Login Again', true);
    }
    const notifications = await Notification.find({user: req.user._id});
    res.json({'notifications': notifications});
}));

router.post('/', auth, asyncMiddleware(async(req, res, next)=>{
    const { error } = validateNotification(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const notification = new Notification(req.body);
    notification.user = req.user._id;
    await notification.save();
    res.send({'message': 'Notification Created Successfully'});
}));

router.put('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const notification = await Notification.findById(req.params.id);
    if(!notification){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'No Notification with this id', true);
    }
    notification.isRead = true;
    await notification.save();
    res.send({'message':'Notification is marked as Read'});
}));

router.put('/read/all', auth, asyncMiddleware(async(req, res, next)=>{
    await Notification.updateMany({user: req.user._id}, {$set:{isRead: true}});
    res.send({'message':'All Notifications are marked as Read'});
}));

router.delete('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const notification = await Notification.findByIdAndRemove(req.params.id);
    if(!notification){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'No Notification with this id', true);
    }
    res.json({message: 'Notification Deleted Successfully'});
}));

router.delete('/delete/all', auth, asyncMiddleware(async(req, res, next)=>{
    const notifications = await Notification.deleteMany({user: req.user._id});
    res.json({message: 'All Notifications Deleted Successfully'});
}));

module.exports = router;