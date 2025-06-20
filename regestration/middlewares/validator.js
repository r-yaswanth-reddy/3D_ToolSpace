const joi = require("joi");

const signupSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({ tlds: { allow: ['com', 'net'] } }),
    password: joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')),
});

const signinSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({ tlds: { allow: ['com', 'net'] } }),
    password: joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')),
});


const acceptedCodeSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({ tlds: { allow: ['com', 'net'] } }),
    providedcode: joi.number().required(),
})

const changePasswordSchema = joi.object({
    newpassword: joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')),
    oldpassword: joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$'))
})

module.exports = {signupSchema, signinSchema, acceptedCodeSchema, changePasswordSchema}