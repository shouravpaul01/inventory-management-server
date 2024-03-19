const mongoose = require('mongoose');
const accessorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'The field is required.'],
        unique: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorie',
        required: [true, 'The field is required.']
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategorie',
        required: [true, 'The field is required.']
    },
    image: {
        type: Object,
        required: [true, 'The field is required.']
    },
    quantityDetails:{
        totalQuantity:{
            type:Number
        },
        allCode:[
            {
                type:String
            }
        ],
        allQuantity: [
            //Count the stock and date of each Product
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: () => new mongoose.Types.ObjectId()
                },
                quantity: {
                    type: Number
                },
                code:[
                    {
                        type:String
                    }
                ],
                date: {
                    type: Date,
                }
            }
        ]
    },
    currentQuantity: {
        type: Number
    },
    orderQuantity: {
        type: Number,
    },
    distributeQuantity: {
        type: Number,
    },
    codeTitle:{
        type:String
    },
    description: {
        type: String,
        required: [true, 'The field is required.']
    },
    isItReturnable: {
        type: String,
        required: [true, 'The field is required.']
    },
    status: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

module.exports = new mongoose.model('Accessorie', accessorySchema)