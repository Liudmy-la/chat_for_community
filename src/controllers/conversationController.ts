import { Request, Response } from "express";
import {allChats, wsTimeSpamp} from '../useWebsocket'

export function maintainChat (req: Request, res: Response) {
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
			messOfChatName = messOfChatName.filter((item: string) => {
					const messageTimestamp = JSON.parse(item).timeStamp
					return new Date(messageTimestamp).getTime() < wsTimeSpamp.getTime()
				})
		}
	}
	
	return res.status(200).json({
		data: {
			chats: chats,
			messOfChatName: messOfChatName,
		}
	})
}