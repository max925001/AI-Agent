import mongoose from "mongoose";
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    aiassistanceName:{
        type:String,
    },
    assistanceImage:{
        type:String,
    },
    history:[
        {type:String}
    ]

},{timestamps:true})


userSchema.pre('save' , async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password =  await bcrypt.hash(this.password,10)
})

userSchema.methods ={
    generateJWTtoken:  async function(){
        return await Jwt.sign(
            {
                id: this._id ,email: this.email,
                
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        )
    }
,
comparePassword: async function(plaintextPassword){

    return  await bcrypt.compare(plaintextPassword,this.password)
},
}

export const User = mongoose.model("User",userSchema)