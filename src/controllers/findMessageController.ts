import { Request, Response } from "express";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";
import {getNickname, getUser, getMessages, getСonnectTime} from "../utils/dbConnectFunctions";


export async function chatHistory (req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}

			const chatId = req.query.id;
			const amount = 10; // from req body

			const user: {userId: number, userNick: string} | null = await getUser(userEmail);
			if (user === null) {
				return res.status(401).json({ error: `Can't find user data.` });
			}
			const userId = user.userId;

			const messagesInChat = await getMessages (Number(chatId), amount);
			
			const connectFrom = userId !== null ? await getСonnectTime(Number(chatId), Number(userId)) : false;
			if (connectFrom === false) {
				return res.status(401).json({ error: `Can't find user connection data.` });
			}

			let prevMessages = messagesInChat.filter((item) => {
					const messageTimestamp = item.timeStamp;
					return connectFrom ? new Date(messageTimestamp).getTime() < connectFrom.getTime() : null
				})
			
			if (!messagesInChat || prevMessages.length === 0) {
				prevMessages = []
			}
			
			return res.status(200).json({
				data: {
					messagesOfChat: prevMessages,
				}
			})
		});
	} catch (error: any) {
		handleErrors(error, res, 'chatHistory');
    }
}

export async function messageInChat (req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}
			
			const chat_id = 102; //from request
			const findBy = '' // from request body: text, nickName

			


			return res.status(200).json({
				data: {
					// messageByNick,
					// messageByText
				}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'messageInChat');
    }
}

export async function messageInList (req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}
			
			const findAmong = '' // from request body: users, groups
			const findBy = '' // from request body: nickName, text - in joined chats; heading, description - all chats 



			return res.status(200).json({
				data: {
					// messageByNick,
					// messageByText
				}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'messageInList');
    }
}