const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const { Schema } = mongoose

const userSchema = new Schema({
    isAdmin: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    street: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
})

// userSchema.virtual('id').get(async () => {
//     return await this._id.toHexString()
// })

// userSchema.set('toJSON', {
//     virtuals: true
// })

const User = mongoose.model('User', userSchema)
module.exports = User