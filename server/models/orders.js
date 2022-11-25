const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const { Schema } = mongoose

const orderSchema = new Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true
    }],
    status: {
        type: String,
        default: "Pending"
    },
    shippingAddress1: {
        type: String,
        required: true
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        min: 0,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
})

// productSchema.virtual('id').get(() => {
//     return this._id.toHexString()
// })

// productSchema.set('toJSON', {
//     virtuals: true
// })

const Order = mongoose.model('Order', orderSchema)
module.exports = Order