const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'The field is required.']
    },
    profession: {
        type: String,
        required: [true, 'The field is required.']
    },
    roomNo: {
        type: Number,
        required: [true, 'The field is required.']
    },
    email: {
        type: String,
        required: [true, 'The field is required.'],
        unique: [true, 'Already exist the email.']
    },
    phoneNumber: {
        type: Number,
    },
    role:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Role'
    }],
    status: {
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
})

module.exports = new mongoose.model('User', userModel)