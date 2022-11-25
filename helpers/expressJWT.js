const { expressjwt: jwt } = require("express-jwt");

const authJwt = () => {
    const secret = process.env.SECRET
    return jwt({
        secret,
        algorithms: ['HS256'],
    }).unless({ path: [
        {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},
        {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
        {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
        "/auth/login",
        "/auth/register"
    ]})
}

const isRevoked = async (request, payload, done) => {
    if(!payload.isAdmin) {
        done(null, true)
    }
    done()
}


module.exports = authJwt