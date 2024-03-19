const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
    role: {
        type: String,
        unique: true,
        required: [true, 'The feild is required.']
    },
    permissions: [
        {
            type: String,
            required: [true, 'The feild is required.']
        }]
}, {
    timestamps: true
})

module.exports = new mongoose.model('Role', roleSchema)