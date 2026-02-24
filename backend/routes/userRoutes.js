import express from "express";
import { login, register, forgotPassword } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.post("/forgot-password", forgotPassword);

export default userRouter;
