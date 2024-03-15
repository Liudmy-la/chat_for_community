import express, { Router } from "express";

import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import * as chatCreateController from "../controllers/chatCreateController";
import * as chatListsController from "../controllers/chatListsController";
import * as chatHistoryController from "../controllers/chatHistoryController";
import * as participantController from "../controllers/participantController";

const router: Router = express.Router();

//auth
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

//user
router.delete("/users", userController.deleteUser);
router.post("/avatar", userController.setAvatar);
router.get("/profile", userController.getUserProfile);

//message
router.get("/conversation", chatHistoryController.chatHistoryInfo);
// router.get("/find", ** findChatByNickname & msgs in this chat ); - in a certain group chat or in all-user's list
// router.get("/find", ** findChatByText  & msgs in this chat); - in a certain chat or in all chats (or choose: only in private - only in group )
// router.get("/find", ** findChatByText ); - in a all-group-chat list

//chats & participants
router.post("/chat-create", chatCreateController.initCreateChat);
router.get("/chat-list", chatListsController.chatsInfo);
router.get("/user-list", chatListsController.usersInfo);

//connection 
// router.post("/participant", ** setWebSocket ); - who push "join the chat" or who open chat
router.delete("/participant",  participantController.deleteParticipant); // who push "leave the chat"

export default router;