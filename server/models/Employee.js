const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    employeeId:{
        type:String,
        required:true,
        unique:true,
    },
     phone:{
        type:String,
        required:true,
    },
     department:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required:true,
    },
     position:{
        type:String,
        required:true,
    },
     joiningDate:{
        type:Date,
        required:true,
    },
    status:{
        type:String,
       enum:["active","inactive"],
       default:"active",
    },
    },
    { 
    timestamps:true,
    }
);

const employee = mongoose.model("Employee", employeeSchema);

module.exports = employee;