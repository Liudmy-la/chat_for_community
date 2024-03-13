import express, { Router } from "express";

import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import * as groupChatController from "../controllers/chatCreateController";
import * as chatListsController from "../controllers/chatListsController";
import * as chatHistoryController from "../controllers/chatHistoryController";

const router: Router = express.Router();

//auth
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

//user
router.delete("/users", userController.deleteUser);
router.post("/avatar", userController.setAvatar);
router.get("/profile", userController.getUserProfile);

//message
router.get("/chat-conversation", chatHistoryController.chatHistoryInfo);
// router.get("/find", ** findChatByNickname);
// router.get("/find", ** findChatByText);

//chats & participants
router.post("/chat-create", groupChatController.createGroupChat);
router.get("/chat-list", chatListsController.chatsInfo);
router.get("/user-list", chatListsController.usersInfo);

export default router;