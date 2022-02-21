const express = require('express');
const { Contact, validateContact } = require('../models/contact');
const asyncMiddleware = require('../middleware/error');
const auth = require('../middleware/auth');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');

const router = express.Router();

router.get('/', auth, asyncMiddleware(async(req, res, next)=>{
    const result = await Contact.find();
    res.json({'Messages': result});
}));

router.post('/', asyncMiddleware(async(req, res, next)=>{
    const { error } = validateContact(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const contactMessage = new Contact(req.body);
    await contactMessage.save();

    res.json({'message': "Message Sent Successfully"});
}));

module.exports = router;