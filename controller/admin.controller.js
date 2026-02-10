import asyncH from "../utils/asyncHandler.js";
import User from "../schema/userSchema.js";

export const promoteToAdmin = asyncH(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("User is already an admin");
  }

  user.role = "admin";
  await user.save();

  res.status(200).json({
    success: true,
    message: "User promoted to admin",
  });
});
