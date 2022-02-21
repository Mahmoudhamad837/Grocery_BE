const BaseError = require("./base.error");

class ApiError extends BaseError{
    constructor(name, httpStatusCode, description, isOpernational){
        super(name, httpStatusCode, description, isOpernational)
    }
}

module.exports = ApiError;