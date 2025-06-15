const mongoose=require("mongoose")

const connectDB=async()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/mindconnect_db");
        console.log("Database connection established successfully!");
    }
    catch(e){
        console.log(e);
    }
}

module.exports = connectDB;