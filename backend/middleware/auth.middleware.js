import jwt from "jsonwebtoken"

const isLoggedIn = async (req ,res, next) =>{

     const {token} = req.cookies
    if(!token){
       
        return res.status(401).json({
            success:false,
            message:"Please login first"
        })
    }
    
const userDetails =  await jwt.verify(token,process.env.JWT_SECRET)
// console.log(userDetails)
req.user = userDetails;

next()
}





export{
    isLoggedIn    
}