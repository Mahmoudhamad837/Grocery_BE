const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    mobileNumber:{
        type: String,
        required: true
    },
    streetName: {
        type: String,
        required: true
    },
    buildingNo: {
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    Governrate:{
        type: String,
        required: true
    },
    addressType:{
        type: String,
        required: true,
        enum: ['home', 'office']
    },
    isDefault:{
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

const Address = mongoose.model('Address', addressSchema);

function validateAddress(address){
    const Schema = Joi.object({
        country: Joi.string().required(),
        fullName: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        streetName: Joi.string().required(),
        buildingNo: Joi.string().required(),
        city: Joi.string().required(),
        district: Joi.string().required(),
        Governrate: Joi.string().required(),
        addressType: Joi.string().required().valid('home', 'office'),
        user: Joi.objectId(),
        isDefault: Joi.boolean()
    });

    return Schema.validate(address);
}

module.exports.Address = Address;
module.exports.validateAddress = validateAddress;