const express = require('express');
const authRouter = express.Router();
const {register, login, logout, adminRegister, deleteProfile, updateProfile} = require('../controllers/userAuthentication');
const userMiddleware = require('../middleware/userMiddleware');
const redisClient = require('../config/redis');
const adminMiddleware = require('../middleware/adminMiddleware')



authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware, logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.delete('/profile', userMiddleware, deleteProfile);
authRouter.put('/profile', userMiddleware, updateProfile);

authRouter.get('/check', userMiddleware, (req,res)=>{
    const reply = {
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        role:req.result.role
    }
    res.status(200).json({
        user:reply,
        message:"Valid User!"
    })
})

// authRouter.post('/getProfile',getProfile);


module.exports = authRouter;