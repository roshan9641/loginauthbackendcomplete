
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name:{
        required:true,
        type:String
    },
    email:{
        required:true,
        type:String,
        unique:true
    },
    password:{
        required:true,
        type:String,
        select: false
    },
    passwordChangedAt: {
  type: Date,
},
role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},
passwordResetToken: String,
passwordResetExpires: Date,


  
},
{timestamps:true}
);
const user = mongoose.model("USER",userSchema);
export default user;