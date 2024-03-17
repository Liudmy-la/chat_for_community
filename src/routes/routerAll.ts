import express, { Router } from "express";

import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import * as chatCreateController from "../controllers/chatCreateController";
import * as chatListsController from "../controllers/chatListsController";
import * as findMessageController from "../controllers/findMessageController";
import * as participantController from "../controllers/participantController";

const router: Router = express.Router();

//auth
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

//user
router.get("/profile", userController.getUserProfile);
router.delete("/user", userController.deleteUser);
// router.post("/avatar", userController.setAvatar); // change to use with mysql

//message
router.get("/find-message", findMessageController.chatHistory);
router.get("/find-message", findMessageController.messageInChat);
// router.get("/find-message", findMessageController.messageInList); // - in all joined chats (or choose: only in private / only in group )

// router.get("/find-chat", ** groupByCaption ); // in titles + descriptions of all-common-group-chat list 
// router.get("/find-chat", ** joinedGroupByCaption ); // in titles + descriptions of all joined group chats or of all OWN groups 
// router.get("/find-chat", ** chatByNickname); // - in private joined chats

//chats & participants
router.post("/chat-create", chatCreateController.initCreateChat);
router.get("/chat-list", chatListsController.chatsInfo);
router.get("/user-list", chatListsController.usersInfo);

//connection 
router.post("/participant", participantController.openChat ); // who push "join the chat" or who open the chat
router.delete("/participant",  participantController.deleteParticipant); // who push "leave the chat"

export default router;