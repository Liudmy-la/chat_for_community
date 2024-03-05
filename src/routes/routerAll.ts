import express, { Router } from "express";

import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import * as messageController from "../controllers/messageController";
import * as groupChatController from "../controllers/groupChatController";
// import * as privateChatController from "../controllers/privateChatController";
import * as conversationController from "../controllers/conversationController";

const router: Router = express.Router();

//auth
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

//user
router.get("/users", userController.getAllUsers); 
router.get("/allCroups", userController.getAllGroups); 
router.delete("/users", userController.deleteUser);
router.post("/avatar", userController.setAvatar);
router.get("/profile", userController.getUserProfile);
router.get("/myGroups", userController.getUserAllCroupChats);
router.get("/myChats", userController.getUserAllPrivateChats);

//message
router.get("/find", messageController.findUserByNickname);

//chats
router.post("/createChat", groupChatController.createGroupChat);
// router.post("/createPrivateChat", privateChatController.createPrivateChat);

router.get('/chat-list', conversationController.chatsInfo);
router.get('/chat-online', conversationController.chatHistoryInfo);

export default router;