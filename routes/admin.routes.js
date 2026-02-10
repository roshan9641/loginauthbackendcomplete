import express from "express";
import {
  displayUser,
  findUserById,
  updateUserById,
  deleteUserById,
} from "../controller/user.controller.js";
import { promoteToAdmin } from "../controller/admin.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

// 🔒 admin only
router.use(authMiddleware, authorizeRoles("admin"));

// 👑 ADMIN PRIVILEGES
router.get("/users", displayUser);
router.get("/users/:id", findUserById);
router.patch("/users/:id", updateUserById);
router.delete("/users/:id", deleteUserById);
router.patch("/promote/:id", promoteToAdmin);

export default router;
