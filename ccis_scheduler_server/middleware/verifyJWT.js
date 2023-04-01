const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError")
require("dotenv").config();

const verifyJWT = async(req, res, next)=>{
    const authHeader = req.header("authorization");
    if(!authHeader) {
         next(new ExpressError(401, "ACCESS DENIED"))
    }else{
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token, process.env.ACCESS_TOKEN, 
        (error, decode) =>{
            if(error) { 
                next(new ExpressError(403, "Invalid Token"))
            }else{
                req.user = decode.id;
                next();
            }
        }
    )
    }
}

module.exports = verifyJWT;