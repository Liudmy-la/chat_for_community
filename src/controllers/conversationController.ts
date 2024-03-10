import { Request, Response } from "express";

import {getChats, getArray, getCommonChats, getNickname, getUser, getMessages, getСonnectTime} from "./onConnectFunctions";

 //---------------------------------------------------------

export async function chatsInfo (req: Request, res: Response) {
	try {
		const chatId: any = req.query.id;		
		const userEmail: string = 'example@box'; // result of authenticateUser
		const userId = await getUser(userEmail);

		const privChatArray = await getArray(true, userId);
		const groupChatArray = await getArray(false, userId);
		
		const commonChats = await getCommonChats();
		const commonArray: any[] = commonChats.map(chat => ({id: chat.chat_id, name: chat.chat_name}));

		if (commonArray.length === 0) {
			return res.status(400).json({
				message: `No Common Chats Available `,
			})
		}
	
		return res.status(200).json({
			data: {
				privChats: privChatArray,
				groupChats: groupChatArray,
				commonChats: commonArray,
			}
		})

	} catch (error: any) {
    	console.error(`Error in chatsInfo: ${error.message}`);
    	return res.status(500).json({ message: "_chatsInfo Error" });
    }
};

export async function chatHistoryInfo (req: Request, res: Response) {
    try {
		const chatId: any = req.query.id;		
		const userEmail: string = 'example@box'; // result of authenticateUser
		const userId = await getUser(userEmail);

		// const privChatArray = await getArray(true, userId);
		// const groupChatArray = await getArray(false, userId);
		
		// const commonChats = await getCommonChats();
		// const commonArray: any[] = commonChats.map(chat => ({id: chat.chat_id, name: chat.chat_name}));

		// if (commonArray.length === 0) {
		// 	return res.status(400).json({
		// 		message: `No Common Chats Available `,
		// 	})
		// }

		const messagesInChat = await getMessages (chatId);

		const connectFrom = await getСonnectTime(chatId, userId);

		const chatsHistory: any[] = [];
		
		for (const msg of messagesInChat) {
				const message = {
					id: msg.message_id,
					text: msg.message_text,
					timeStamp: msg.timestamp,
					sender: await getNickname(msg.user_id),
				}

				chatsHistory.push(message);
			};
			
		let prevMessages = chatsHistory.filter((item) => {
				const messageTimestamp = item.timeStamp;
				return connectFrom ? new Date(messageTimestamp).getTime() < connectFrom.getTime() : null
			})
		
		if (!messagesInChat || prevMessages.length === 0) {
			prevMessages = []
		}
		
		return res.status(200).json({
			data: {
				// privChats: privChatArray,
				// groupChats: groupChatArray,
				// commonChats: commonArray,
				messOfChatName: prevMessages,
			}
		})

	} catch (error: any) {
    	console.error(`Error in chatHistoryInfo: ${error.message}`);
    	return res.status(500).json({ message: "_chatHistoryInfo Error" });
    }
}
