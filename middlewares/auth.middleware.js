import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../schema/userSchema.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("User is not authenticated");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 🔹 Fetch user from DB
  const user = await User.findById(decoded._id);

  if (!user) {
    throw new Error("User not found");
  }

  // 🔹 STEP 3: Invalidate old tokens
  if (
    user.passwordChangedAt &&
    decoded.iat * 1000 < user.passwordChangedAt.getTime()
  ) {
    throw new Error("Password changed recently. Please login again.");
  }

  req.user = {
  _id: user._id,
  role: user.role,
};

  next();
});

export default authMiddleware;
