const express = require('express')
const router = express.Router();
const jwt = require("jsonwebtoken")
const User = require('../models/users')
const bcrypt = require('bcrypt')


// Login User
router.post('/login', async(request, response) => {
    let user = await User.findOne({
        email: request.body.email,
    })

    const secret = process.env.SECRET

    if(user && bcrypt.compareSync(request.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user._id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: "1d"}
        )
        return response.status(200).json({success: true, user: {email: user.email, name: user.name}, token: token})
    }

    return response.status(400).json({ error: 'user not found or invalid password', success: false }) 
    
})

// Register user
router.post(`/register`, async (request, response) => {
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

module.exports = router