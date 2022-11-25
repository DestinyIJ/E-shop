const errorHandler = (err, req, res, next) => {
    if(err) {
        res.status(401).json(err)
    }
}

module.exports = errorHandler