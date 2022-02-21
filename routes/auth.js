const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const {User, validateUser} = require('../models/user');
const auth = require('../middleware/auth');
const {sendMail} = require('../middleware/mail');
const req = require('express/lib/request');
const upload = require('../middleware/upload');
const asyncMiddleware = require('../middleware/error');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const router = express.Router();

router.post('/login', asyncMiddleware(async(req, res, next)=>{
    const { error } = validateLogin(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const user = await User.findOne({email: req.body.email});
    if(!user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'Invalid Email Or Password', true);
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword){
        throw new ApiError('Invalid Password', HttpStatusCode.BAD_REQUEST, 'Please Enter a valid Password', true);
    }

    if(!user.isVerified){
        throw new ApiError('Verify Error', HttpStatusCode.BAD_REQUEST, 'Please Verify Your Email to Login', true);
    }

    const token = jwt.sign({_id: user._id}, 'jwtPrivateKey');
    user.token = token;

    res.send(_.pick(user, ['_id', 'name', 'email', 'image', 'token']));
}));

router.post('/signup', upload.single("image"), asyncMiddleware(async(req, res, next)=>{
    const { error } = validateSignup(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    let user = await User.findOne({email: req.body.email});
    if(user){
        throw new ApiError('Invalid', HttpStatusCode.BAD_REQUEST, 'User Already Registered', true);
    }
    const salt = await bcrypt.genSalt(10);
    user = new User(req.body);
    console.log(req.body);
    if(user.password !== req.body.checkPassword){
        throw new ApiError('Invalid Password', HttpStatusCode.BAD_REQUEST, 'Password Mis Match', true);
    }
    user.password = await bcrypt.hash(user.password, salt);
    user.verifyCode = generateCode(5);
    await user.save();
    sendMail(req.body.email, user.verifyCode);
    res.send({'message': 'User Signed Successfully'});
}));

router.post('/verify', asyncMiddleware(async(req, res, next)=>{
    const {error} = validateCode(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }

    const user = await User.findOne({email: req.body.email});
    if(!user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'Invalid User', true);
    }
    if(user.verifyCode != req.body.code){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Please Enter The Code Sent on Mail', true);
    }
    user.isVerified = true;
    await user.save();
    res.json({message: "Email Verified Successfully"});
}));

router.get('/me', auth, async(req, res, next)=>{
    const user = await User.findById(req.user._id).select('-password -role -verifyCode');
    res.send(user);
});

router.post('/reset', auth, async(req, res, next)=>{
    const user = await User.findById(req.user._id);
    
    if(await bcrypt.compare(req.body.newPassword, user.password)){
        return res.status(400).send('You must enter new Password');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();

    res.send(_.pick(user, ['_id', 'name', 'email', 'image']));
});

router.post('/change', auth, asyncMiddleware(async(req, res, next)=>{
    const {error} = validateChange(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError('Invalid User', HttpStatusCode.BAD_REQUEST, 'You have to Login Again', true);
    }

    const isValidPassword = await bcrypt.compare(req.body.oldPassword, user.password);
    if(!isValidPassword){
        throw new ApiError('Invalid Password', HttpStatusCode.BAD_REQUEST, 'The Old Password Entered is Invalid', true);
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Passwords must Match', true);
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();
    res.json({message: 'Password Changed Successfully'});
}));

function validateLogin(req){
    const Schema = Joi.object({
        email:Joi.string().email().required().min(10).max(255),
        password: Joi.string().required().min(6).max(255)
    });

    return Schema.validate(req);
}

function validateSignup(user){
    const Schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(6).required(),
        checkPassword: Joi.string().min(6).required(),
    });

    return Schema.validate(user);
}

function validateCode(code){
    const Schema = Joi.object({
        code: Joi.string().required().min(5).max(5),
        email: Joi.string().email().required()
    });
    return Schema.validate(code);
}

function validateChange(data){
    const Schema = Joi.object({
        oldPassword: Joi.string().required().min(6),
        newPassword: Joi.string().min(6).required(),
        confirmPassword: Joi.string().min(6).required()
    });

    return Schema.validate(data);
}

function generateCode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

module.exports = router;