import express from "express";
import { login, register, forgotPassword, getMe, logout } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.post("/forgot-password", forgotPassword);

// Protected routes - require authentication
userRouter.get("/me", authMiddleware, getMe);
userRouter.post("/logout", logout);

export default userRouter;
