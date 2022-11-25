const express = require('express')
const router = express.Router();
const OrderItem = require('../models/orderitems')

// get all categories
router.get('/', async (request, response) => {
    let categories = await OrderItem.find()
    categories ? response.status(201).json(categories) : response.status(500).json({ error: 'Database Error', success: false })
})


// get a single orderItem by id
router.get('/:id', async (request, response) => {
    let orderItem = await OrderItem.findById(request.params.id)
    orderItem ? response.status(201).json(orderItem) : response.status(500).json({ error: 'Could not find orderItem with id', success: false })
})

// update orderItem by id
router.put('/:id', async (request, response) => {
    let orderItem = await OrderItem.findByIdAndUpdate(
        request.params.id,
        {
            quantity: request.body.quantity,
            product: request.body.product
        },
        { new:true }
    )
    orderItem ? response.status(201).json(orderItem) : response.status(500).json({ error: 'Could not update orderItem with id', success: false })
})

// post orderItem to db
router.post(`/`, async (request, response) => {
    let orderItem = await OrderItem.find({
        product: request.body.product,
    })
    if(orderItem.length) {
        response.status(500).json({ error: 'orderItem already exist', success: false })
        
    } else {
        orderItem = new OrderItem({
            quantity: request.body.quantity,
            product: request.body.product
        })
    
        orderItem = await orderItem.save()
    
        orderItem ? response.status(201).json(orderItem) : response.status(500).json({ error: 'Failure saving orderItem', success: false })
    }
    
})


// delete orderItem by id
router.delete('/:id', (request, response) => {
    OrderItem.findByIdAndDelete(request.params.id).then(orderItem => {
        return  response.status(201).json({ orderItem, success: true})
    }).catch(err => {
        return response.status(500).json({ error: err, success: false })
    })
})

module.exports = router