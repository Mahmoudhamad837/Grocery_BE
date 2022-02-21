class BaseError extends Error{
    constructor(name, httpStatusCode, description, isOperanational){
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.httpStatusCode = httpStatusCode;
        this.description = description;
        this.isOperanational = isOperanational;

        Error.captureStackTrace(this);
    }
}

module.exports = BaseError;