import Joi from 'joi';

export const articleIdSchema = Joi.object({
    id: Joi.number().integer().required()
});

export const articleSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required()
});
