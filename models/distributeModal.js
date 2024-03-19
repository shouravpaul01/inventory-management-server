const mongoose=require('mongoose')

const distributeModel=new mongoose.Schema({
    invoiceId: {
        type: String
    },
    receiverName: {
        type: String,
        required: [true, "The field is required."]
    },
    receiverEmail: {
        type: String,
        required: [true, "The field is required."]
    },
    roomDetails: {
        roomType:{
            type:String,
            required: [true, "The field is required."]
        },
        roomNo:{
            type: Number,
            required: [true, "The field is required."]
        }
        
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
                type: String,
            },
            quantity: {
                type: Number
            },
            allCode:[
                {
                    type:String
                }
            ],
            returned: {
                status: {
                    type: Boolean
                },
                date: {
                    type: Date
                },
                receivedReturned: {
                    status:{
                        type:Boolean,
                    },
                    email:{
                        type:String,
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
    received: {
        status: {
            type: Boolean,
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

module.exports=new mongoose.model('Distribute',distributeModel)