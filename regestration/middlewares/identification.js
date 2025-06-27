const jwt = require("jsonwebtoken")

function identification(req, res, next) {
    let token;
    if(req.headers.client === "not-browser"){
        token = req.headers.authorization
    }
    else{
        token = req.cookies["Authorization"]
    }

    if(!token){
        return res.status(403).json({success: false, message: "unauthorised" })
    }

    try {
        const usertoken = token.split(' ')[1]
        const jwtverified = jwt.verify(usertoken, process.env.TOKEN_SECRET)
        if(jwtverified){
            req.user = jwtverified;
            next();
        }
        else{
            throw new Error('error in the token')
        }
        
        
    } catch (error) {
        
    }
}
module.exports = identification;
module.exports.identifier = identification;
