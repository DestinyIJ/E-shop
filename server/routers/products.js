const express = require('express')
const router = express.Router();
const Product = require('../models/products')
const Category = require('../models/categories')
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
    "image/png" : "png",
    "image/jpg" : "jpg",
    "image/jpeg" : "jpeg"
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const extension = FILE_TYPE_MAP[file.mimetype]
        let uploadError = null
        if(!extension) {
            uploadError = new Error('Invalid File Type. Must be an image with extension jpg, jpeg, or png')
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.replace(' ', '_')
        cb(null, Date.now() + '_' + fileName)
    }
})
  
const upload = multer({ storage: storage })

// get all products
router.get('/', async (request, response) => {
    let filter = {}
    if(request.query.categories) {
        filter = { category: request.query.categories.split(",") }
    }

    let product = await Product.find(filter).populate('category')
    product ? response.status(200).json(product) : response.status(500).json({ error: 'Unable to fetch products', success: false })
})

// get product count
router.get('/get/count', async (request, response) => {
    const productsCount = await Product.countDocuments()
    if(!productsCount) return response.status(500).json({ error: 'Server could not fetch products count', success: false })
    response.status(200).json({ count: productsCount, success: true })
})

// get featured product
router.get('/get/featured', async (request, response) => {
    Product.find({ isFeatured: true}).then( products => {
        products.length ? response.status(200).json(products) : response.status(200).json({ error: 'No featured products', success: false })
    }).catch(error => {
        return response.status(500).json({ error: 'Server could not fetch featured products', success: false })
    })
})

// get specific number of featured products
router.get('/get/featured/:count', async (request, response) => {
    const count = request.params.count
    Product.find({ isFeatured: true}).limit(+count).then(products => {
        response.status(200).json(products)
    }).catch(error => {
        return response.status(500).json({ error: 'Server could not fetch featured products', success: false })
    })
})

// get a single product by id
router.get('/:id', async (request, response) => {
    if(!mongoose.isValidObjectId(request.params.id)) {
        return response.status(400).json({ error: 'Invalid product id', success: false })
    }
    let product = await Product.findById(request.params.id).populate('category')
    product ? response.status(200).json(product) : response.status(400).json({ error: 'Could not find product with id', success: false })
})




// update product by id
router.put('/:id', upload.single('image'), async (request, response) => {
    if(!mongoose.isValidObjectId(request.params.id)) {
        return response.status(400).json({ error: 'Invalid product id', success: false })
    }
    if(request.body.category) {
        let category = await Category.findById(request.body.category)
        if(!category) return response.status(400).json({ error: 'category does not exist', success: false })
    }
    
    let product = await Product.findById(request.params.id)
    if(!product) return response.status(400).json({ error: 'No Such Product in Database', success: false }) 

    const file = request.file
    let imagePath;

    if(file) {
        const basePath = `${request.protocol}://${request.get('host')}/public/uploads`
        imagePath = `${basePath}/${request.file.filename}`
    } else(
        imagePath = product.image
    )

    Product.findByIdAndUpdate(
        request.params.id,
        {
            image: imagePath,
            brand: request.body.brand,
            price: request.body.price,
            rating: request.body.rating,
            numReviews: request.body.numReviews,
            isFeatured: request.body.isFeatured,
            name: request.body.name,
            description: request.body.description,
            category: request.body.category,
            reviews: request.body.reviews,
            countInStock: request.body.countInStock,
            richDescription: request.body.richDescription,
            images: request.body.images
        },
        { new:true }
    ).then(product => {
        product ? response.status(200).json(product) : response.status(400).json({ error: 'Could not update product with id', success: false })
    }).catch(error => {
        response.status(500).json({ error: error, success: false })
    })
})

// update image gallery
router.put('/gallery-images/:id', upload.array('images', 10), async (request, response) => {
    if(!mongoose.isValidObjectId(request.params.id)) {
        return response.status(400).json({ error: 'Invalid product id', success: false })
    }

    let product = await Product.findById(request.params.id)
    if(!product) return response.status(400).json({ error: 'No Such Product in Database', success: false }) 

    const files = request.files
    const basePath = `${request.protocol}://${request.get('host')}/public/uploads`

    if(files) {
        files.map(file => {
            imagePaths.push(`${basePath}/${file.filename}`)
        })
    }
    let imagePaths = []

    Product.findByIdAndUpdate(
        request.params.id,
        {
            images: request.body.images
        },
        { new:true }
    ).then(product => {
        product ? response.status(200).json(product) : response.status(400).json({ error: 'Could not update product with id', success: false })
    }).catch(error => {
        response.status(500).json({ error: error, success: false })
    })
})


// post product to db
router.post(`/`, upload.single('image'), async (request, response) => {
    let category = await Category.findById(request.body.category)
    if(!category) return response.status(400).json({ error: 'category does not exist', success: false })
    
    let product = await Product.findOne({
        name: request.body.name,
        category: request.body.category
    })

    Product.findOne({
        name: request.body.name,
        category: request.body.category
    }).then(product => {
        if(product) return response.status(400).json({ error: 'product already exist', success: false }) 
    })

    if(!request.file) return response.status(400).json({ error: 'No Product Image in request', success: false }) 

    const basePath = `${request.protocol}://${request.get('host')}/public/uploads`
    const fileName = `${basePath}/${request.file.filename}`
    
    product = new Product({
        image: fileName,
        brand: request.body.brand,
        price: request.body.price,
        rating: request.body.rating,
        isFeatured: request.body.isFeatured,
        name: request.body.name,
        description: request.body.description,
        category: request.body.category,
        countInStock: request.body.countInStock,
        richDescription: request.body.richDescription
    })

    product = await product.save()

    product ? response.status(201).json(product) : response.status(500).json({ error: 'Failure saving product', success: false })
})


// delete product by id
router.delete('/:id', (request, response) => {
    if(!mongoose.isValidObjectId(request.params.id)) {
        return response.status(400).json({ error: 'Invalid product id', success: false })
    }
    Product.findByIdAndDelete(request.params.id).then(product => {
        return  response.status(201).json({ product, success: true})
    }).catch(err => {
        return response.status(500).json({ error: err, success: false })
    })
})

module.exports = router

