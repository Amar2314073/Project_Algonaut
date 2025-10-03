const express = require('express');
const app = express();
require('dotenv').config();
const main = require("./config/db");
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemCreation');
const submitRouter = require('./routes/submit');
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreation");
const cors = require('cors');


app.use(cors({
    origin:'http://localhost:5173',
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());


app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);


const InitializeConnection = async()=>{
    try{
        await Promise.all([main(),redisClient.connect()]);
        console.log("Connected to Database");

        app.listen(process.env.PORT, ()=>{
            console.log(`Server listening at port number : ${process.env.PORT}`);
        })
    }
    catch(err){
        console.log("Error: "+err.message);
    }
}

InitializeConnection();


	
// dvm4ovv0x
// 674514926561139
// JkdB4570gFlTZyGPflE9bzK7uE8
