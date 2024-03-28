const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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
            quantity: {
                type: Number
            },
            allCode:[
                {
                    type:String
                }
            ],
            deadline: {
                type: Date
            },
            returned: {
                status: {
                    type: Boolean
                },
                date: {
                    type: Date
                },
                recievedReturned: {
                    email:{
                        type:String,
                    },
                    status:{
                        type:Boolean,
                        default:false
                    },
                    date:{
                        type:Date
                    }
                }
            }
        }
    ],
    approve: {
        status:{
            type: Boolean,
        },
        email:{
            type:String
        },
        date:{
            type:Date
        }
       
    },
    recievedOrder: {
        status: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date
        }
    },
    returnedAll: {
        status: {
            type: Boolean
        },
        date: {
            type: Date
        }
    }

}, {
    timestamps: true
})

module.exports = new mongoose.model('Order', orderSchema)