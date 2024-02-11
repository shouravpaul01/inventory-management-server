const mongoose = require('mongoose');
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'The field is required.'],
        unique:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Categorie',
        required:[true,'The field is required.']
    },
    subCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Subcategorie',
        required:[true,'The field is required.']
    },
    image:{
        type:Object,
        required:[true,'The field is required.']
    },
    quantity:{
        type:Number,
        required:[true,'The field is required.']
    },
    description:{
        type:String,
        required:[true,'The field is required.']
    },
    returnStatus:{
        type:String,
        required:[true,'The field is required.']
    },
    status:{
        type:String,
        default:"active"
    }
    
},{
    timestamps:true
})

module.exports=new mongoose.model('Product',productSchema)