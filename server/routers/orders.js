const express = require('express')
const router = express.Router();
const Order = require('../models/orders')
const OrderItem = require('../models/orderitems')
const User = require('../models/users');
const { response } = require('express');

// get all orders
router.get('/', async (request, response) => {
    let orders = await Order.find().populate({ path:"orderItems", populate: {
                                                    path: "product", populate: "category"} }).populate("user", "name").sort({"dateOrdered": -1})
    orders ? response.status(200).json(orders) : response.status(500).json({ error: 'Database Error', success: false })
})


// get total order sales
router.get('/get/totalsales', async (request, response) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: "$status", totalsales: { $sum : "$totalPrice"} }}
    ])
    if(!totalSales) {
        return response.status(404).json({ error: 'Unable to determine Total Sales', success:false})
    }

    console.log(totalSales)
    response.status(200).json(totalSales)
})

// get order count
router.get('/get/count', async (request, response) => {
    const ordersCount = await Order.countDocuments()
    if(!ordersCount) return response.status(500).json({ error: 'Server could not fetch orders count', success: false })
    response.status(200).json({ count: ordersCount, success: true })
})


// get a single order by id
router.get('/:id', async (request, response) => {
    let order = await Order.findById(request.params.id).populate({ path:"orderItems", populate: { path: "product", populate: "category" } }).populate("user", "name")
    order ? response.status(200).json(order) : response.status(400).json({ error: 'Could not find order with id', success: false })
})

// get a single order by id
router.get('/get/user/:id', async (request, response) => {
    const totalOrders = await Order.find({user: request.params.id}).populate({ path:"orderItems", populate: { path: "product", populate: "category" } }).populate("user", "name").sort({'dateOrdered' : -1})
    if(!totalOrders) {
        return response.status(404).json({ error: "Could not get User orders", success: false })
    }
    response.status(200).json(totalOrders)
})


// update order by id
router.put('/:id', async (request, response) => {
    let order = await Order.findByIdAndUpdate(
        request.params.id,
        {
            status: request.body.status,
        },
        { new:true }
    )
    order ? response.status(201).json(order) : response.status(500).json({ error: 'Could not update order with id', success: false })
})

// post order to db
router.post(`/`, async (request, response) => {
    const orderItemsIds = Promise.all(request.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save()

        return newOrderItem._id
    }))

    const orderItemsIdsResolved = await orderItemsIds

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)  => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))

    // let totalPrice = 0
    // totalPrices.forEach(orderTotal => {
    //     totalPrice += orderTotal
    // });

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        status: request.body.status,
        shippingAddress1: request.body.shippingAddress1,
        shippingAddress2: request.body.shippingAddress2,
        city: request.body.city,
        zip: request.body.zip,
        country: request.body.country,
        phone: request.body.phone,
        totalPrice: totalPrice,
        user: request.body.user
    })

    order = await order.save()

    order ? response.status(201).json(order) : response.status(500).json({ error: 'Failure saving order', success: false })
    
})


// delete order by id
router.delete('/:id', (request, response) => {
    Order.findByIdAndDelete(request.params.id).then(order => {
        if(!order) {
            return response.status(404).json({ message: "order not found", success: false})
        }
        order.orderItems.map(async (orderItemId) => {
            await OrderItem.findByIdAndDelete(orderItemId)
        })


        return response.status(200).json({ order, success: true})

    }).catch(err => {
        response.status(500).json({ error: err, success: false })
    })
})



module.exports = router