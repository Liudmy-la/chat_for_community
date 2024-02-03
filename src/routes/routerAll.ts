import express from "express";
import { Router} from "express";
import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import * as messageController from "../controllers/messageController";
import * as groupChatController from "../controllers/groupChatController";
import * as privateChatController from "../controllers/privateChatController";

import {allChats, wsTimeSpamp} from '../index'

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
router.post("/createPrivateChat", privateChatController.createPrivateChat);

router.get('/chat-list', function (req, res) {
	const chat: any = req.query.id;

	if (allChats.size === 0) {
		return res.status(400).json({
			message: `No Chats Available `,
		})
	}

	const list = Object.fromEntries(allChats);
	const chats = Object.keys(list);
	
	let messOfChatName: any;
	if (chat && allChats.has(chat)) {
		const chatData = allChats.get(chat);

		if (chatData) {
			messOfChatName = chatData.messStorage;
			messOfChatName = messOfChatName.filter(
				(item: string) => new Date(JSON.parse(item).timeStamp).getTime() < wsTimeSpamp.getTime())
		}
	}

	return res.status(200).json({
		data: {
			chats: chats,
			messOfChatName: messOfChatName,
		}
	})
})

export default router;