import { json } from "express";
import geminiResponse from "../gemini.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";




const cookieOptions = {
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite:'None',
    secure: true

}

export const signup = async (req,res) =>{

const {name,email,password} = req.body

try {

    if(!name || !email || !password){
        return res.status(400).json({ success:false,message:"All fields are required"})
    }
    if(password.length < 6){
        return res.status(400).json({ success:false,message:"Password must be at least 6 characters"})
    }

    const existingUser = await User.findOne({email})

    if(existingUser){
        return res.status(400).json({ success:false,message:"Email already exists"})
    }

    if(password.length < 6){
        return res.status(400).json({ success:false,message:"Password must be at least 6 characters"})
    }
    

    const user = await User.create({name,email,password})

    const token = await user.generateJWTtoken()
    res.cookie('token' ,token ,cookieOptions)

     return res.status(201).json({success:true,message:"User created successfully",user})


} catch (error) {
    
    return res.status(500).json({ success:false,message:"Something went wrong"})
}



}


export const login = async (req,res) =>{

const {email,password} = req.body

try {

    if( !email || !password){
        return res.status(400).json({ success:false,message:"All fields are required"})
    }

    const user = await User.findOne({email}).select('+password')

    if(!user){
        return res.status(400).json({ success:false,message:"Invalid credentials"})
    }

  const isMatch = await user.comparePassword(password)

  if(!isMatch){
      return res.status(400).json({ success:false,message:"Invalid credentials"})
  }

    const token = await user.generateJWTtoken()
    user.password = undefined
    res.cookie('token' ,token ,cookieOptions)

     return res.status(201).json({success:true,message:"User logged in successfully",user})


} catch (error) {
    
    return res.status(500).json({ success:false,message:"Something went wrong"})
}

}

export const logout = (req,res) =>{

res.cookie('token' ,null ,{
    secure:true,
    maxAge:0,
    httpOnly:true
})

res.status(200).json({
    success:true,
    message:'User Logout Successfully'

})

}



 export const getProfile =  async(req,res,next) =>{

    const userId = req.user.id;
try{
    
const user = await User.findById(userId)
if(!user){
    return res.status(404).json({ success:false,message:"User not found"})
}
res.status(200).json({
    success:true,
    message:'user details',
    user
})
}catch(e){
return res.status(500).json({ success:false,message:"Something went wrong"})

}

}



export const updateAssistant = async (req, res) => {
  const userId = req.user.id;
  const { aiassistanceName,  assistanceImage } = req.body;
  const imageFile = req.file; // File uploaded via Multer

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update assistant name if provided
    if (aiassistanceName !== undefined) {
      if (typeof aiassistanceName !== "string" || !aiassistanceName.trim()) {
        return res.status(400).json({ success: false, message: "Assistant name must be a non-empty string" });
      }
      user.aiassistanceName = aiassistanceName.trim();
    }

    // Handle image upload to Cloudinary if a file is provided (custom assistant)
    if (imageFile) {
      const cloudinaryResponse = await uploadOnCloudinary(imageFile.path);
      if (!cloudinaryResponse) {
        return res.status(500).json({ success: false, message: "Failed to upload image to Cloudinary" });
      }
      user.assistanceImage = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    } else if (assistanceImage) {
      // Handle predefined image URL if provided
      if (typeof assistanceImage !== "string" || !assistanceImage.trim()) {
        return res.status(400).json({ success: false, message: "Assistant image URL must be a non-empty string" });
      }
      user.assistanceImage = assistanceImage.trim();
    }

    // Save the updated user
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Assistant details updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};



export const askToAssistant = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        assistant: null,
        user: null,
        intent: "error",
        response: "User not found",
        data: null
      });
    }

    const username = user.name;
    const assistantName = user.aiassistanceName;
    const command = req.body.command;

    if (!command || typeof command !== 'string' || !command.trim()) {
      return res.status(400).json({
        assistant: assistantName,
        user: username,
        intent: "error",
        response: "Command is required and must be a non-empty string",
        data: null
      });
    }

    const response = await geminiResponse(command, assistantName, username);

    if (!response) {
      return res.status(404).json({
        assistant: assistantName,
        user: username,
        intent: "error",
        response: "Assistant not found",
        data: null
      });
    }
   

    // Check if the intent is "error" or "unknown"
    if (response.intent === "error" || response.intent === "unknown") {
      return res.status(200).json({
        assistant: assistantName,
        user: username,
        intent: response.intent,
        response: "I can't understand",
        data: null
      });
    }

    // Directly return the response from geminiResponse
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in askToAssistant:", error);
    return res.status(500).json({
      assistant: null,
      user: null,
      intent: "error",
      response: "Something went wrong",
      data: null
    });
  }
};