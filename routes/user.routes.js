import express from "express";
import {
  getMe,
  updateme,
  changePassword,
} from "../controller/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔒 user must be logged in
router.use(authMiddleware);

// 👤 ONLY SELF
router.get("/me", getMe);
router.patch("/me", updateme);
router.patch("/me/password", changePassword);

export default router;
