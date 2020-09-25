import jwt from "jsonwebtoken"
const getToken = (user) =>{
    return jwt.sign(user,"JWTsecret"
    // ,{
        // expiresIn: '48h'
    // }
    )
}

export {getToken}