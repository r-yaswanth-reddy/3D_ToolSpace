const { string, required, ref } = require("joi")
const mongoose = require("mongoose")

const postschema = mongoose.Schema({
    title: {
        type: string,
        required: [true, "title is required!"],
        trim: true,
    },
    description: {
        type: string,
        required: [true, "description is required"],
        trim: true,
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
})

module.exports = mongoose.model("Post", postschema)