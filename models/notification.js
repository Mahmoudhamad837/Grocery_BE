const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const notificationSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now()
    },
    isRead:{
        type: Boolean,
        default: false
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

function validateNotification(notification){
    const Schema = Joi.object({
        title : Joi.string().required(),
        content : Joi.string().required(),
        user: Joi.objectId()
    });
    return Schema.validate(notification);
}

module.exports.Notification = Notification;
module.exports.validateNotification = validateNotification;