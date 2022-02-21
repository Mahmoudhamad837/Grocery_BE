const mongoose = require('mongoose');
const Joi = require('joi');

const copounSchema = new mongoose.Schema({
    copoun: {
        type: String,
        required: true
    },
    discount:{
        type: Number,
        required: true
    }
});

const Copoun = mongoose.model('Copoun', copounSchema);

function validateCopoun(copoun){
    const schema = Joi.object({
        copoun: Joi.string().required(),
        discount: Joi.string().required()
    });

    return schema.validate(copoun);
}

module.exports.Copoun = Copoun;
module.exports.validateCopoun = validateCopoun;