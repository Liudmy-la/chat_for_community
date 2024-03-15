import { Request, Response } from "express";

import {getNickname, getUser, getMessages, getСonnectTime} from "../utils/dbConnectRoutesFunctions";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";

 //---------------------------------------------------------

export async function chatHistoryInfo (req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}

			const chatId: any = req.query.id;		
			const user = await getUser(userEmail);

			const userId = user !== null ? user.userId : null

			const messagesInChat = await getMessages (chatId);

			const connectFrom = userId !== null ? await getСonnectTime(chatId, userId) : false;
			if (connectFrom === false) {
				throw Error(`Can't find user connection data. Refresh the page.`)
			}

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
					messOfChatName: prevMessages,
				}
			})
		});
	} catch (error: any) {
		handleErrors(error, res, 'chatHistoryInfo');
    }
}

// find by text/name/nickame
