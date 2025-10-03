const redisClient = require("../config/redis");
const User = require("../models/user");
const validateUser = require("../utils/validateUser")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Submission = require('../models/submission'); 
const ms = require('ms');


// Register

const register = async(req,res)=>{

    try{
        // validate the data
        validateUser(req.body);

        const {firstName, emailId, password} = req.body;
        req.body.role = 'user';

        // hashing the password before register
        req.body.password = await bcrypt.hash(password,10);

        // creating user and sending token after register
        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id, emailId:emailId, role:'user'}, process.env.JWT_KEY, {expiresIn:'1d'})
        res.cookie('token',token,{maxAge:ms('1d')});

        const reply = {
            firstName: user.firstName,
            emailId:user.emailId,
            _id:user._id,
            role:user.role
        }
        
        res.status(200).json({
            user:reply,
            message:"Registered Successfully!"
        });

    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

// Login

const login = async(req,res)=>{
    try{
        const {emailId, password} = req.body;
        if (!emailId || !password) {
            throw new Error("Invalid Credentials!");
        }

        // verifying the presence of email and password in database
        const user = await User.findOne({emailId});
        if(!user)
            throw new Error("User doesn't exist!");

        // vefifying password 
        const match = await bcrypt.compare(password,user.password);
        
        if(!match)
            throw new Error("Invalid Credentials!");

        // Generate JWT token
        const token = jwt.sign(
        { _id: user._id, emailId: user.emailId, role:user.role },
        process.env.JWT_KEY,
        { expiresIn: "1d" }
        );

        const reply = {
            firstName: user.firstName,
            emailId:user.emailId,
            _id:user._id,
            role:user.role
        }
        // Send token in cookie
        res.cookie("token", token, { maxAge:ms('1d') });

        res.status(200).json({
            user:reply,
            message:"Logged in Successfully!"
        });

    }
    catch(err){
        res.status(401).send("Error: "+err.message);
    }
}

// Logout

const logout = async(req,res)=>{
    try{

        // validate the token and if it is valid then add it to Redis blocklist and clear the token
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null, {expires:new Date(Date.now())});
        res.send("Logged out successfully!");
    }
    catch(err){
        res.stats(503).send("Error: "+err.message);
    }
}

// adminRegister

const adminRegister = async(req,res)=>{
    try{
        
        // validate the data
        validateUser(req.body);

        const {firstName, emailId, password} = req.body;

        // hashing the password before register
        req.body.password = await bcrypt.hash(password,10);

        // sending token after register
        const user = await User.create(req.body);
        
        const token = jwt.sign({_id:user._id, emailId:emailId, role:user.role}, process.env.JWT_KEY, {expiresIn:60*60})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send("User Registered Successfully!");

    }
    catch(err){
        res.send("Error: "+err);
    }
}

// delete User profile 

const deleteProfile = async(req,res)=>{
    try{
        const userId = req.result._id;
        // Deleting userSchema 
        await User.findByIdAndDelete(userId);

        // Deleting submission
        // await Submission.deleteMany({userId});       // we will do it by post command in userSchema 

        res.status(200).send("Deleted Successfully!");

    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}


module.exports = {register, login, logout, adminRegister, deleteProfile};

