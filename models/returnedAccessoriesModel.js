const mongoose = require("mongoose");

const returnedAccessoriesSchema = new mongoose.Schema({
    invoiceId: {
        type: String
    },
    userName: {
        type: String,
        required: [true, "The field is required."]
    },
    userEmail: {
        type: String,
        required: [true, "The field is required."]
    },
    roomNo: {
        type: Number,
        required: [true, "The field is required."]
    },
    accessories: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            name: {
                type: String,
            },
            isItReturnable: {
                type: String
            },
            orderQuantity: {
                type: Number
            },
            deadline: {
                type: Date
            },
            returned:{
                status:{
                    type:Boolean
                },
                date:{
                    type:Date
                }
            }
        }
    ],

    recieptStatus: {
        type: Boolean,
        default: false
    },
    returnedAll:{
        status:{
            type:Boolean
        },
        date:{
            type:Date
        }
    }

}, {
    timestamps: true
})

module.exports = new mongoose.model('returnedAccessorie', returnedAccessoriesSchema)