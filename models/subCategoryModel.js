const mongoose = require("mongoose");

const subCategorySchema=new mongoose.Schema({
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Categorie",
        required: [true, "The field is required."],
    },
    name:{
        type:String,
        required: [true, "The field is required."],
        unique:true
    },
    status:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
})

module.exports=new mongoose.model('Subcategorie',subCategorySchema)