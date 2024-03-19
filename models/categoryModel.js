const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true, 'Already exist the name.'],
        required: [true, 'The field is required.']
    },

    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategorie' }],
    
    status: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

module.exports = new mongoose.model('Categorie', categorySchema)