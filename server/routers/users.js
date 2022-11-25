const express = require('express')
const router = express.Router();
const User = require('../models/users')
const bcrypt = require('bcrypt')



// get all users
router.get('/', async (request, response) => {
    let users = await User.find().select("-passwordHash")
    users ? response.status(201).json(users) : response.status(500).json({ error: 'Database Error', success: false })
})


// get a single user by id
router.get('/:id', async (request, response) => {
    let user = await User.findById(request.params.id).select("-passwordHash")
    user ? response.status(201).json(user) : response.status(500).json({ error: 'Could not find user with id', success: false })
})

// get users count
router.get('/get/count', async (request, response) => {
    const usersCount = await User.countDocuments()
    if(!usersCount) return response.status(500).json({ error: 'Server could not fetch products count', success: false })
    response.status(200).json({ count: usersCount, success: true })
})


// update user by id
router.put('/:id', async (request, response) => {
    let user = await User.findByIdAndUpdate(
        request.params.id,
        {
            isAdmin: request.body.isAdmin,
            name: request.body.name,
            email: request.body.email,
            passwordHash: bcrypt.hashSync(request.body.password, 10),
            phone: request.body.phone,
            city: request.body.city,
            country: request.body.country,
            street: request.body.street,
            zip: request.body.zip,
            apartment: request.body.apartment
        },
        { new:true }
    )
    user ? response.status(201).json(user) : response.status(500).json({ error: 'Could not update user with id', success: false })
})


// post user to db
router.post(`/`, async (request, response) => {
    let user = await User.findOne({
        email: request.body.email,
    })
    if(user) {
        return response.status(500).json({ error: 'user already exist', success: false })  
    } 

    user = new User({
        isAdmin: request.body.isAdmin,
        name: request.body.name,
        email: request.body.email,
        passwordHash: bcrypt.hashSync(request.body.password, 10),
        phone: request.body.phone,
        city: request.body.city,
        country: request.body.country,
        street: request.body.street,
        zip: request.body.zip,
        apartment: request.body.apartment
    })

    user = await user.save()

    user ? response.status(201).json(user) : response.status(500).json({ error: 'Failure saving user', success: false })
})


// delete user by id
router.delete('/:id', (request, response) => {
    User.findByIdAndDelete(request.params.id).then(user => {
        return  response.status(201).json({ user, success: true})
    }).catch(err => {
        return response.status(500).json({ error: err, success: false })
    })
})





module.exports = router