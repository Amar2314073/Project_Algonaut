# V8 engine

--> V8 engine is C++ code which can understand javascript.
--> V8 can be embedded into any C++ application.



# <!-- ************************************************************************************************* -->




# import and export in commonjs module or CJS module
module.exports = something;
const something = require('./filename');

module.exports = {first, second, third};
const {first, second, third} = require('./filename');

IIFE: import method of CJS in which everything gets imported in the file in the form of a function
(code of the file)()  --> format of IIFE
for using `import export` write in your package.json file ` "type" = "module" `
or make `.mjs` file instead of `.js`

for using `require` write in your package.json file ` "type" = "commonjs" `

`if we use require from any folder and do not give the file name inside the folder then by default index.js from that folder will be imported`




# <!-- ********************************************************************************************* -->





# lLibuv in nodejs, file reading

----------------------------------------------------------------------------------------------

libuv is a C++ code.which can use Timers(setTimeOut, setIntervals, etc), Files(fetching, etc), Network Call etc. libuv is a multi-platform support library with a focus on asynchronous I/O.It interacts with Operating System.

----------------------------------------------------------------------------------------------------

`how to read file in libuv`-->
const fs = require('fs');
--> fs.readFile("./data.json", "utf-8" (err,res) => { console.log(res); })   --> Asynchronus file reading
--> fs.readFileSync("./data.json", "utf-8" (err, res)=> { console.log(res)})  --> Synchronus file reading    

-------------------------------------------------------------------------------------------------

const fs = require('fs');

fs.readFile('./data.json', "utf-8", (err,res)=>{  `libuv handles it puts it in callstack queue, asynchronous`
    console.log("\nAsynchronous");
    console.log(res);
    console.log("Asynchronous\n");
})

---------------------------------------------------------------------------------------------------

const data = fs.readFileSync('./data.json', "utf-8");  `JS handles it runs synchronously`
console.log("\nSynchronous");
console.log(data); 
console.log("Synchronous\n");
console.log("Last line");

----------------------------------------------------------------------------------------------



# <!-- ********************************************************************************************* -->






# Creating server

web socket = IP + Port_Number


const port_number = 4000;
const http = require('http');

const server = http.createServer((req,res)=>{
    if(req.url === '/'){
        res.end("Home Page");
    }
    else if(req.url === '/about'){
        res.end("About Page");
    }
    else if(req.url === '/contact'){
        res.end("Contact Page');
    }
    else{
        res.end("Error: Page not found");
    }
});

server.listen(port_number, ()=>{
    console.log("Server listining on port 4000");
})


# <!-- ********************************************************************************************* -->






# creating server using express

We can create the server using `express` which is more easy 

1. npm install express
2. npm i -g nodemon                     `to dynamically run the backend`
3. sudo npm i -g nodemon                `if 2. command is not working`

const express = require('express');
const app = express();

<!-- frontend javasript code for post operation using fetch api  -->
<!-- we can do it by using express in easier way -->
const response = await fetch('url', {
    method: 'POST',                           `or GET or PUT or DELETE or PATCH`
    headers:{
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: 'John', age: 34})
})


<!-- we can use following CRUD operations using express -->

app.use('route', middleware, (req,res,next)=>{
    res.status(status_code).send(response)
    res.status(status_code).json(response_json_format);
    res.send(response);
    res.cookie('token', token_generated, {expires: })
})
app.get(route, middleware, callback_function)
app.put(route, middleware, callback_function)
app.patch(route, middleware, callback_function)
app.delete(route, middleware, callback_function)

app.use('/about')     --> 
1. abou?t  -->    'u' becomes optional
2. abou+t  -->    'u' can be repeated multiple time
3. abou*t  -->    'u' can be replaced by any character or word

app.listen(4000,()=>{
    console.log("server listening at port 4000");
})


app.use('/about/:id/:name' , (req,,res)=>{
    <!-- to get id -->
    console.log(req.params);   --> returns object {id: 'user_id', name: 'user_name'}
    console.log(req.body);
    console.log(req.query);
    console.log(req.method);
    console.log(req.url);
})

# <!-- ********************************************************************************************* -->






# parsing

-------------------------------------------------------------------------------------

<!-- parsing is an middleware which converts the data in json format -->
app.use(express.json());
In Express.js, express.json() is middleware.
It tells Express:
“If the incoming HTTP request has Content-Type: application/json, then take the raw JSON body (string) and parse it into a JavaScript object and put it in req.body.”


-------------------------------------------------------------

JSON = JavaScript Object Notation != JavaScript Object
1. key and values are stored in string format
2. can be in object or in array format
3. JSON is language independet

--------------------------------------------------------------

Parser: is like a translator.
It takes data in some format (like JSON text) and converts it into a structure your program can understand (like JavaScript objects).

----------------------------------------------------------------
JavaScript has a built in function for converting

1. JSON strings into JavaScript objects:
JSON.parse()

let jsObj = {name: "John", age: 34}
JSON.parse(jsObj)  -->  {"name": "John", "age": 34}  = converted into json object
express.json()  --> do the same work as JSON.parse() `(express.json() internally uses JSON.parse())`


2. an object into a JSON string:
JSON.stringify()
let jsonObj = {"name": "John", "age": 34}
JSON.stringify(jsonObj)  -->  {name: "John", age: 34}  = converted into js object

-------------------------------------------------------------------------------------


# <!-- ********************************************************************************************* -->






# Middleware in Express.js

--------------------------------------------------------------------------------

Usage:
app.use('/route', middlewareFn, (req,res)=>{ res.send("Done") });

- Order matters → runs in sequence defined
- Multiple middleware can be chained

--------------------------------------------------------------------------------

Flow Control:
function middleware(req,res,next){
   console.log("Before");
   next();   // passes control
   console.log("After"); // runs after if response not ended
}

--------------------------------------------------------------------------------

Error-handling Middleware:
- Special middleware with 4 parameters
app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

--------------------------------------------------------------------------------

Examples:

// Global middleware
app.use((req,res,next)=>{
    console.log(`${req.method} ${req.url}`);
    next();
});

--------------------------------------------------------------------------------

// Built-in
app.use(express.json());

--------------------------------------------------------------------------------

// Router-level
router.use((req,res,next)=>{
    console.log("Router specific");
    next();
});

--------------------------------------------------------------------------------

// Error handling
app.use((err, req, res, next)=>{
    res.status(500).json({error: err.message});
});

--------------------------------------------------------------------------------


# <!-- ********************************************************************************************* -->






# HTTP Status Codes – Practical Usage Notes

--------------------------------------------------------------------------------

## 1xx → Informational
- 100 Continue → Request received, client should continue sending
- 101 Switching Protocols → Protocol upgrade successful
- 102 Processing → Server is processing request (WebDAV)

--------------------------------------------------------------------------------

## 2xx → Success (client request successful)
- **200 OK** → Normal GET/PUT request success; send response data
- **201 Created** → Resource created successfully (POST)
- **202 Accepted** → Request accepted but processing later (async tasks)
- **204 No Content** → Success but no response body (like DELETE)

--------------------------------------------------------------------------------

## 3xx → Redirection
- **301 Moved Permanently** → URL permanently changed (SEO friendly redirect)
- **302 Found** → Temporary redirect (user will come back)
- **304 Not Modified** → Client cache is still valid (no new data)

--------------------------------------------------------------------------------

## 4xx → Client Errors (something wrong in client request)
- **400 Bad Request** → Invalid JSON / missing fields / wrong input
- **401 Unauthorized** → User must login / token missing or invalid
- **403 Forbidden** → User logged in but not allowed (no permission)
- **404 Not Found** → Requested resource doesn’t exist
- **405 Method Not Allowed** → Using POST on GET-only endpoint
- **409 Conflict** → Duplicate resource / conflict in current state
- **422 Unprocessable Entity** → Valid JSON but semantic errors (e.g., invalid email format)

--------------------------------------------------------------------------------

## 5xx → Server Errors (problem on server)
- **500 Internal Server Error** → Unexpected error on server
- **501 Not Implemented** → Feature not supported by server
- **502 Bad Gateway** → Server got invalid response from upstream
- **503 Service Unavailable** → Server overloaded or under maintenance
- **504 Gateway Timeout** → Upstream server didn’t respond in time

--------------------------------------------------------------------------------

# <!-- ********************************************************************************************* -->






# Database and mongoDB

**Data**: collection of raw facts and figures.

**Information**: processed data.

**Database**: structured collection of data that is organized, stored, and managed in such a way that it can be easily accessed, updated, and managed by software applications.

**DBMS**: manager of the database, making sure data is stored properly, can be accessed quickly, and is safe from errors or unauthorized access.

-------------------------------------------------------------------------------------------------------

<!-- ACID Properties (Database Transactions) -->

1. **Atomicity** → All parts of a transaction succeed or none at all (all-or-nothing).  
2. **Consistency** → Database moves from one valid state to another; rules and constraints are preserved.  
3. **Isolation** → Concurrent transactions do not interfere; each sees a consistent state.  
4. **Durability** → Once a transaction is committed, changes are permanent, even if system crashes.

-------------------------------------------------------------------------------------------------------

Vertical Scaling(scaling up): improves database performance by adding more resources(CPU, RAM, starage) to a single server.

Horizontal Scaling(scaling out): improves performance by adding more servers to a cluster to distribute the work load.

Sharding: technique for horizontally scaling a database.

-------------------------------------------------------------------------------------------------------

SQL: Structured Query Language.
noSQL: Not Only SQL.

MongoDB is a noSQL database.
install it from chrome.

**cluster**: collection of servers
**collection**: group of documents
**document**: user info or data or whatever we save in our database.
--------------------------------------------------------------------------------------------------------

<!-- Connect with DB -->
we can connect to mongoDB by using mongoDB but we will use mongoose to make it easy.



# <!-- ********************************************************************************************* -->





# Mongoose

npm i mongoose

1. used to connect with database
2. used to define schema
3. to apply query on database and perform CRUD operations
----------------------------------------------------------------------------------------------------
<!-- To connect with mongoDB or database -->

const mongoose = require('mongoose');

async function main(){
    await mongoose.connect('mongodb+srv://amararya780:Amar%40Gupta780@codingcluster.vf2wl4y.mongodb.net/collection_name');

}

<!-- Query in mongoose -->

User.deleteMany()
User.deleteOne()
User.find()
User.findById()
User.findByIdAndDelete()
User.findByIdAndRemove()
User.findByIdAndUpdate(id, update, {"runValidators":true});
User.findOne()
User.findOneAndDelete()
User.findOneAndReplace()
User.findOneAndUpdate(id, update, option)
User.replaceOne()
User.updateMany()
User.updateOne()

----------------------------------------------------------------------------------------------------------
<!-- Schema creation and validation -->

const mongoose = require('mongoose');
const {Schema} = mongoose;


const userSchema = new Schema({
    name:{
        type: String,
        required:true,
        minLength: 3,
        maxLength: 20
    }
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true           --> can't be changed by update method
    },
    age:{
        type:Number,
        min:6,
        max:80
    },
    gender:{
        type: String,
        <!-- enum:['male', 'female', 'other'], -->
        validate(value){
            if(!['male', 'female', 'other'].includes(value))
                throw new Error("Invalid gender");
        }
    },
    role:{
        type:String,
        enum:['user', 'admin'],
        default:'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        unique:true
    },
    password:{
        type:String,
        required:true
    }
    
},{
    timestamps:true
});

const User = mongoose.model("user", userSchema);
module.exports = User;
------------------------------------------------------------------------------------------------------

**methods in mongoose**
userSchema.methods.Function_name = function(){
    `code`
}

-----------------------------------------------------------------------------------------------------

# <!-- ******************************************************************************************** -->







# password store in database

1. encryption  (but can be decrypted by key)   -->  (use one way encryption = hashing)
2. hashcode  (simple or easy passwords can be decrypted by brute force approach or rainbow table)
3. salting    (store hashcode of `password + salt`) -->  (if same salt is used then if the user password is same then the password + salt combination will be same for the users and if there are many users with same password then hacker will try to decrypt that hashcode which is repeated multiple time) --> (use different salt)
4. use variable salt  



npm i bcrypt

<!-- how to use bcrypt -->

const bcrypt = require('bcrypt');
const password = 123456;
async function Hashing(){
    const salt = await bcrypt.genSalt(number_of_iterations);        `generates salt`
    const hashpass = await bcrypt.hash(password, number_of_iterations or salt)    `hashcode + salt generates different salt every time the fucntion runs if number_of_iterations is given if salt is given then it creates hashcode with salt given`
    
    const isValidUser = await bcrypt.compare(password, password_saved_in_db)      `to compare the password`
}



# <!-- ******************************************************************************************** -->






# API level validation

npm install validator

const validator = require('validator');
const bcrypt = require('bcrypt');

<!-- now we can verify user details using built in validator function -->
if(!validator.isEmail(data.emailId))
    throw new Error('Invalid Email');
if(!validator.isStrongPassword(data.password))
    throw new Error('Week Password');

`same as above we can check the length of name gender etc.`

req.body.password = await bcrypt.hash(req.body.password, 10); `storing encrypted password in database`




# <!-- ******************************************************************************************* -->





# Digital Signature and JWT token

npm install jwt

**JWT token** = [header = Base64URL Encode] + [payload = Base64URL Encode] + Signature
**JWT token** = base64url(Header) + "." + base64url(Payload) + "." + Signature


**header** = {
  "alg": "HS256",       `algorithm used for signature`
  "typ": "JWT"          `typ of  token used`
}

**payload** = {
  "sub": "1234567890",       `user id`
  "name": "Alpha",
  "role": "admin",
  "exp": 1700000000         `expiry time`
  `in payload we can add whatever we want`
}

**Signature (JWT)** = 

- If HS256: HMACSHA256(message, secret_key)
- agar JWT me "alg": "HS256" diya hai, to:
  `message ka hash nikala jata hai aur usko secret key ke sath HMAC karke signature banaya jata hai`

- If RS256: Encrypt(Hash(message), private_key)
- agar JWT me "alg": "RS256" diya hai, to:
  `message ka hash nikalke usko private key se encrypt kiya jata hai (yahi hota hai digital signature)`

**Message** = base64url(Header) + "." + base64url(Payload)  
`ye message JWT ke signature banate waqt use hota hai`

------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------

**Digital Signature (general)** =  
Used outside of JWT — jaise files, emails, etc. me

```
Digital Signature = message + [Signature = Hash(message), then encrypted with Private Key]
```

Ye ensure karta hai ki:
- Message badla nahi gaya (Integrity)
- Message asli sender ne bheja (Authentication)

------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------

**Sending token**

npm install jwt

<!-- how to generate jwt token -->

const jwt = require('jsonwebtoken');
const token = jwt.sign(payload_object, secret_key, expiresIn: 60*60 or '2h' or '3 days' or '7d')
res.cookie('token', token);
res.cookie('token', null, expires: new Date(Date.now()));

-----------------------------------------------
jwt.sign({
  data: 'foobar'
}, 'secret', { expiresIn: 60 * 60 });

//or even better:

jwt.sign({
  data: 'foobar'
}, 'secret', { expiresIn: '1h' });
-----------------------------------------------

<!-- to use cookie we need to parse it using cookie parser  -->

npm install cookie-parser

const cookieParser = require('cookie-parser');

app.use(cookieParser());


<!-- how to verify the token -->
const payload = jwt.verify(req.cookies.token, secret_key);
const user = await User.findById(payload.id);




# <!-- **************************************************************************************** -->





# environment variable

- make a .env file and create the environment variables in that file
`to access the environment variables`
npm i dotenv
require('dotenv').config();




# <!-- **************************************************************************************** -->







# Router in express

const express = require('express');
const authRouter = express.Router();

authRouter.get('/path', middleware, (req,res,next)=>{});
authRouter.post('/path', callback_function);





# <!-- **************************************************************************************** -->








# Redis

npm i redis

----------------------------------------------------
const redis = require('redis');

const redisClient = redis.createClient({
    username: '',
    password: '',
    socket:{
        host: '',
        port: 
    }
});

const connectRedis = async()=>{
    await redisClient.connect();
    console.log("Connected to redis");
}
module.exports = connectRedis;
------------------------------------------------------


const redisClient = require('../config/redis');
const jwt = require('jsonwebtoken')'
const {token} = req.cookies;
const payload = jwt.decode(token);
await redisClient.set(`token:${token}`, 'Blocked');
<!-- await redisClient.expire(`token:${token}`,1800);   time in seconds -->
await redisClient.expireAt(`token:${token}`, payload.exp);
-------------------------------------------------------------------------------

<!-- To check if token exists in redis -->
const IsBlocked = redisClient.exists(`token:${token}`);




# <!-- **************************************************************************************** -->










# RateLimiter 

const jwt = require('jsonwebtoken');
const User = require('../Models/users');
const redisClient = require('../config/redis');

const rateLimiter = async(req,res,next)=>{
    try{
        const ip = req.ip;
        let count = redisClient.incr(ip);            `ip will be incremented`

        if(count == 1)
            await redisClinet.expire(60*60);

        if(count > 60)
            throw new Error('User Limit Exceeded');
        
        next();

    }
    catch(error){
        res.send("Error: "+ error);
    }
}

module.exports = rateLimiter;

<!-- use it as below in main file as middleware -->
app.use(rateLimiter);




# <!-- **************************************************************************************** -->







# Sliding window RateLimiter

const windowSize = 3600;        `time in seconds`
const maxRequest = 60;

const rateLimiter = async(req,res,next)=>{
    try{
        const key = req.ip;
        const current_time = Date.now()/1000;
        const window_time = current_time - windowSize;   `window_time se pahle wale ko hatana hai`
        await redisClient.zRemRangeByScore(key, 0, window_time);       `Rem = remove` `removes all entries from 0 to the time given means upto window_time`
        
        const numberOfRequest = redisClient.zCard(key);

        if(numberOfRequest >= maxRequest)
            throw new Error("Number of request Exceeded"); 
        
        await redisClient.zAdd(key, [{score:current_time, value:`${current_time}:${Math.random()}`}]);

        await redisClient.expire(key, windowSize);
    }
    catch(error){
        res.send("Error: "+error);
    }
}

module.exports = rateLimiter;





# <!-- **************************************************************************************** -->







# CORS
npm install cors





# <!-- **************************************************************************************** -->
# <!-- **************************************************************************************** -->
# <!-- **************************************************************************************** -->






#   A l g o n a u t _ p e r f o r m e r  
 