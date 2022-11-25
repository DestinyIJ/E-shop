const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const { Schema } = mongoose

const orderItemSchema = new Schema({
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }
})

const OrderItem = mongoose.model('OrderItem', orderItemSchema)
module.exports = OrderItem