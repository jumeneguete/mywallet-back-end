import joi from 'joi';

const schema = joi.object({
    name: joi.string().min(3).replace(" ", ""),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().min(1).replace(" ", ""),
    positiveValue: joi.number().positive().integer(),
    negativeValue: joi.number().negative().integer(),
    description: joi.string(),
    date: joi.date().iso(),
    token: joi.string().min(10)
}).unknown(true);

export { schema }