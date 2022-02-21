const mongoose = require('mongoose');
const Joi = require('joi');

const contactSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    }
});

const Contact = mongoose.model('Contact', contactSchema);

function validateContact(contact){
    const Schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        message: Joi.string().required()
    });

    return Schema.validate(contact);
}

module.exports.Contact = Contact;
module.exports.validateContact = validateContact;