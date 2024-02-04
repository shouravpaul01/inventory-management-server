const  mongoose= require("mongoose");

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        unique: [true, 'Already exist the name.'],
        required:[true,'The field is required.']
    },
    status:{
        type:String,
        default:"active"
    }

},{
    timestamps:true
})

module.exports=new mongoose.model('Categorie',categorySchema)