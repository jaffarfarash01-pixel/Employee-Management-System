const mongoose = require("mongoose");
const process = require("node:process");
const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongo connected successfully");
        
    }catch(error){
        console.log("connection failed: ",error.message);
        process.exit(1);
        
    }
};
module.exports = connectDB;