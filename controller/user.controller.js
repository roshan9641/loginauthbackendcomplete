import asyncH from "../utils/asyncHandler.js"
import User from "../schema/userSchema.js"
import bcrypt from "bcrypt"
import jwt from"jsonwebtoken"
import crypto from "crypto"
export const createUser = asyncH(async(req,res)=>{
    const user = await User.create(req.body);
    res.status(201).json({user})
})


export const displayUser = asyncH(async(req,res)=>{
    const user = await User.find({});
    res.status(200).json({user})
})

export const findUserById = asyncH(async(req,res)=>{
    const {id} = req.params;
    const user = await User.findById(id);
     if (!user) {
    throw new Error("User not found");
  }
    res.status(200).json({user})
})

export const deleteUserById = asyncH(async(req,res)=>{
    const {id} = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
    throw new Error("User not found");
  }
    res.status(200).json({
        success:true,
        message:"User deleted successfully",
        user})
})

export const updateUserById = asyncH(async(req,res)=>{
    const {id} = req.params;
    const user = await User.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});
     if (!user) {
    throw new Error("User not found");
  }
    res.status(200).json({
        success:true,
        message:"user updated successfully",
        user
    })
})

export const registerUser = asyncH(async(req,res)=>{
   const {name,email,password} = req.body;
     if(!email){
throw new Error("email is required")
  }
 const finalemail = email.toLowerCase().trim();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(finalemail)) {
  throw new Error("Invalid email format");
}

if(!password){
    throw new Error("password is required");
}
const passwordRegex =   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if(!passwordRegex.test(password)){
    throw new Error("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
}

    const existingUser = await User.findOne({email:finalemail})
     if (existingUser) {
    throw new Error("User Already exsit");
  }

  const hashpassword = await bcrypt.hash(password,10);


  const newUser=  await User.create({name,email:finalemail,password:hashpassword})
    const token = jwt.sign({_id:newUser._id},process.env.JWT_SECRET,{expiresIn:"24h"})
    res.status(201).json({
        success:true,
        message:` register successfully`,
        token,
         user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
    })
})


export const loginUser= asyncH(async(req,res)=>{
  const {email,password} = req.body;

  if (!email) {
    throw new Error("Email is required")
  }
 const finalemail = email.toLowerCase().trim();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(finalemail)) {
  throw new Error("Invalid email format")
}

if(!password){
    throw new Error("password is required");
}

const existingUser = await User.findOne({ email: finalemail }).select("+password");

if(!existingUser){
  throw new Error("Invalid email or password");
}
const comparePassword = await bcrypt.compare(password,existingUser.password);

if (!comparePassword) {
  throw new Error("email or password is wrong");
}
const token  = jwt.sign({_id:existingUser._id},process.env.JWT_SECRET,{expiresIn:"24h"})
res.status(200).json({
  success:true,
  message:"you login successfully",
  token,
  existingUser:{
     id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
  }
})
});

export const getMe = asyncH(async (req, res) => {
const user = await User.findById(req.user._id);


if(!user){
  throw new Error("User not found");
}
res.status(200).json({
  success:true,
  user,
});
});

export const updateme=asyncH(async(req,res)=>{
  const { name, email } = req.body;
const user = await User.findByIdAndUpdate(req.user._id,{email,name},{new:true,runValidators:true});
 if (!user) {
    throw new Error("User not found");
  }
    res.status(200).json({
        success:true,
        message:"user updated successfully",
        user
    })
})

export const changePassword = asyncH(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    throw new Error("Current password is required");
  }

  if (!newPassword) {
    throw new Error("New password is required");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    );
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const hashpassword = await bcrypt.hash(newPassword, 10);

  user.password = hashpassword;
  user.passwordChangedAt = Date.now();

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const logoutUser = asyncH(async(req,res)=>{
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
})

export const forgotPassword = asyncH(async (req, res) => {
  const { email } = req.body;

  const finalemail = email.toLowerCase().trim();
  if (!finalemail) {
    throw new Error("email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(finalemail)) {
    throw new Error("Invalid email format");
  }

  const user = await User.findOne({ email: finalemail });
  if (!user) {
    throw new Error("user is not exist");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: "Password reset link sent",
    resetUrl, 
  });
});

export const resetPassword = asyncH(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    throw new Error("New password is required");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    );
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Reset token is invalid or has expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful. Please login again.",
  });
});


