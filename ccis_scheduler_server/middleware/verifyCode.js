const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError")
require("dotenv").config();

const verifyCode = async(req, res, next)=>{
    const authHeader = req.header("authorization");
    if(!authHeader)  {
        next(new ExpressError(401, "ACCESS DENIED"))
    }else{
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token, process.env.EMAIL_CODE_TOKEN, 
            (error, decode) =>{
                if(error) { next(new ExpressError(403, "VERIFICATION CODE IS INVALID OR EXPIRED, PLEASE SEND ANOTHER CODE"))
            }else{
                req.user = {id: decode.id, _code: decode.code};
                next();
            }
            }
        )
    }
}

module.exports = verifyCode;