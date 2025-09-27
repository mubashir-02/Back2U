const Joi = require('joi');

module.exports.itemSchema = Joi.object({
    item: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        number: Joi.number().required().max(10),
        name: Joi.string().required(),
        image: Joi.string().required().allow("",null),
    }).required(),
});
