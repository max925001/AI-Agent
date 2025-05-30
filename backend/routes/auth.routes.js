import { Router } from "express";
import { askToAssistant, getProfile, login, logout, signup, updateAssistant } from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const authrouter = Router()

authrouter.post('/register' ,signup )
authrouter.post('/login' ,login)
authrouter.post('/logout' ,logout)
authrouter.get('/getuserdetails',isLoggedIn,getProfile)
authrouter.put('/updateuserdetails',isLoggedIn,upload.single('image'),updateAssistant)
authrouter.post('/asktoassistant',isLoggedIn,askToAssistant)



export default authrouter

