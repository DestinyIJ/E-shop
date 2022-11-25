// ***** Required Libraries *****
const express = require('express');
const expressJson = express.json();
const cors = require('cors');
const morgan = require('morgan');
const authJwt = require('../helpers/expressJWT')
const errorHandler = require('../helpers/errorHandler')
const mongoose = require('mongoose')
const { ServerApiVersion } = require('mongodb');
require('dotenv/config');
// ===== Required Libraries =====



// ***** Routers *****
const categoryRouter = require('./routers/categories')
const orderItemRouter = require('./routers/orderitems')
const orderRouter = require('./routers/orders')
const productsRouter = require('./routers/products')
const userRouter = require('./routers/users')
const authRouter = require('./routers/auth')
// ===== Routers =====



// ***** Environment variables *****
const PORT = process.env.SERVER_PORT || 8001;
const API_URL = process.env.API_URL
// ===== Environment variables =====



//  ***** Initializing App *****
const app = express();
const server = require('http').createServer(app);
// ===== Initializing App =====



// ***** App middlewares *****
app.use(expressJson);
app.use(cors());
app.options('*', cors)
app.use(authJwt())
app.use(errorHandler)
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(morgan('tiny')) // logs the requests along with some other information depending upon its configuration and the preset used.
// ===== App middlewares =====



// ***** Connecting to MongDB Atlas *****
const uri = process.env.MONGODB_URI
mongoose.connect(uri, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    serverApi: ServerApiVersion.v1, 
    dbName: 'eshop-db'
}).then(() => {
    console.log('database connection successful')
}).catch((error) => {
    console.log(error)
})
// ===== Connecting to MongDB Atlas =====



// ***** App routes *****
app.get('/', (request, response) => {
    response.send('hello world')
})
app.use(`${API_URL}/categories`, categoryRouter)
app.use(`${API_URL}/orderitems`, orderItemRouter)
app.use(`${API_URL}/orders`, orderRouter)
app.use(`${API_URL}/products`, productsRouter)
app.use(`${API_URL}/users`, userRouter)
app.use(`/auth`, authRouter)
// ===== App routes =====



server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})