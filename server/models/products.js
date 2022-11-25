const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const { Schema } = mongoose

const productSchema = new Schema({
    image: {
        type: String,
        default: ''
    },
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    reviews: [{
        avatar: {
            type: String
        },
        name: {
            type: String
        },
        review: {
            type: String
        }
    }],
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    richDescription: {
        type: String,
        default: ''
    },
    images: [{
        type: String,
    }],
    dateCreated: {
        type: Date,
        default: Date.now()
    }

})

// productSchema.virtual('id').get(() => {
//     return this._id.toHexString()
// })

// productSchema.set('toJSON', {
//     virtuals: true
// })

const Product = mongoose.model('Product', productSchema)
module.exports = Product