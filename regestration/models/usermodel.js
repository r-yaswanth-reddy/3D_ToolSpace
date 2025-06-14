// const { string, required, boolean, number } = require("joi")
const mongoose = require("mongoose")

const userschema = mongoose.Schema({
    // username: {
    //     type: string,
    //     required: [true, "user name is required"],
    //     minlength: [5, "user name must be atleast 5 characters"],

    // },
    email: {
        type: String,
        required: [true, "email is required"],
        trim: true,
        unique: [true, "email must be unique"],
        minlength: [5, "user name must be atleast 5 characters"],
        lowercase: true,

    },
    password: {
        type: String,
        required: [true, "passwors is required"],
        trim: true,
        select: false,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationCodeValidation: {
        type: Date,
        select: false,
    },
    forgotpasswordcode: {
        type: String,
        select: false,
    },
    forgotpasswordcodevalidation: {
        type: Number,
        select: false,
    },

},{
    timestamps: true
});

module.exports = mongoose.model("user", userschema)
