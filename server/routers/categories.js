const express = require('express')
const router = express.Router();
const Category = require('../models/categories')
const mongoose = require('mongoose')

// get all categories
router.get('/', async (request, response) => {
    let categories = await Category.find()
    categories ? response.status(201).json(categories) : response.status(500).json({ error: 'Database Error', success: false })
})


// get a single category by id
router.get('/:id', async (request, response) => {
    if(!mongoose.isValidObjectId(request.params.id)) {
        return response.status(400).json({ error: 'Invalid id', success: false })
    }
    let category = await Category.findById(request.params.id)
    category ? response.status(201).json(category) : response.status(500).json({ error: 'Could not find Category with id', success: false })
})

// update category by id
router.put('/:id', async (request, response) => {
    if(!mongoose.isValidObjectId(request.params.id)) {
        return response.status(400).json({ error: 'Invalid id', success: false })
    }
    let category = await Category.findByIdAndUpdate(
        request.params.id,
        {
            name: request.body.name,
            color: request.body.color,
            icon: request.body.icon
        },
        { new:true }
    )
    category ? response.status(201).json(category) : response.status(500).json({ error: 'Could not update category with id', success: false })
})

// post category to db
router.post(`/`, async (request, response) => {
    let category = await Category.find({
        name: request.body.name,
    })
    if(category.length) {
        response.status(500).json({ error: 'Category already exist', success: false })
        
    } else {
        category = new Category({
            name: request.body.name,
            color: request.body.color,
            icon: request.body.icon
        })
    
        category = await category.save()
    
        category ? response.status(201).json(category) : response.status(500).json({ error: 'Failure saving category', success: false })
    }
    
})


// delete category by id
router.delete('/:id', (request, response) => {
    if(!mongoose.isValidObjectId(request.params.id)) {
        return response.status(400).json({ error: 'Invalid id', success: false })
    }
    Category.findByIdAndDelete(request.params.id).then(category => {
        return  response.status(201).json({ category, success: true})
    }).catch(err => {
        return response.status(500).json({ error: err, success: false })
    })
})

module.exports = router