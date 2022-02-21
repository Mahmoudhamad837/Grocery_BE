const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        min:3,
        max:50,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        min:6
    },
    image:{
        type: String
    },
    gender:{
        type: String,
        enum:['male', 'female'],
    },
    mobile: {
        type: String,
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    verifyCode: { type: String },
    role:{
        type: String,
        enum:['user', 'admin', 'delivery_boy'],
        default: 'user'
    }
});

const User = mongoose.model('User', userSchema);

function validateUser(user){
    const Schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(6),
        image: Joi.string(),
        gender: Joi.string().required().valid('male', 'female'),
        mobile: Joi.string().required(),
        role: Joi.string().valid('admin', 'user', 'delivery_boy'),
    });

    return Schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;