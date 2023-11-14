import {
  authController,
  chat,
  loginController,
  members,
  myFriend,
  registerController,
  startCall,
} from "../controllers/registerController.js";
import { userModel } from "../models/registration.js";
import express from "express";

const appRouter = express.Router();

appRouter.post("/register", registerController);
appRouter.post("/login", loginController);
appRouter.get("/auth", authController, startCall);
appRouter.get("/memb", authController, members);
appRouter.post("/chat", authController, chat);
appRouter.get("/friends", authController, myFriend);

export default appRouter;
