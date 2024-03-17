import { Request, Response } from "express";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";
import {connect} from '../db/dbConnect';
import {getUser, getPreviousMessages, getСonnectTime, messagesInsideByText, messagesInsideByNick} from "../utils/dbConnectFunctions";
import {truncateArray} from "../utils/truncateArray";

async function fetchData(func: Function, args: any[]) {
	const db = await connect();
	return await func(db, ...args);
};

// get last <<numberToDisplay>> items to display
async function getLastElements (data: any, numberToDisplay: number) {
	return data !== false 
		? truncateArray(data, numberToDisplay)
		: null;
};

export async function chatHistory (req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}

			const chatId = req.query.id;
			const numberToDisplay = 10 // from request: initially ask 10 items, "show more" ask "previos_amount +10"

			const user: {userId: number, userNick: string} | null = await getUser(userEmail);
			if (user === null) {
				return res.status(401).json({ error: `Can't find user data.` });
			};

			const userId = user.userId;

			const messagesInChat = await getPreviousMessages (Number(chatId)); 
			
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

			// get last <<numberToDisplay>> items to display
			const lastElements = truncateArray(prevMessages, numberToDisplay);
			
			return res.status(200).json({
				data: {
					messagesOfChat: lastElements,
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
			
			const chatId = 102; //from request
			if (!chatId) {
				return res.status(401).json({ error: "Invalid or missing chatId" });
			}

			const numberToDisplay = 10 // from request: initially ask 10 items, "show more" ask "previos_amount +10"

			const textToFind = ("string from request").trim(); // from request body: part of text
			const userToFind =  ("string from request").trim(); // from request body: part of nickName
			
			// const messagesWithText = 
			// 	!!textToFind 
			// 	&& textToFind.length !== 0 
			// 	&& (await fetchData(messagesInsideByText, [Number(chatId), textToFind]));
			// 		const lastElementsByText = 
			// 			messagesWithText !== false 
			// 			&& truncateArray(messagesWithText, numberToDisplay);

			// const messagesFromSender = 
			// 	!!userToFind 
			// 	&& userToFind.length !== 0 
			// 	&& (await fetchData(messagesInsideByNick, [Number(chatId), userToFind]));
			// 		const lastElementsByNick = 
			// 			messagesFromSender !== false 
			// 			&& truncateArray(messagesFromSender, numberToDisplay);

			const [messagesWithText, messagesFromSender] = await Promise.all([
				(!!textToFind && textToFind.length !== 0) 
					? fetchData(messagesInsideByText, [Number(chatId), textToFind]) 
					: false,
				(!!userToFind && userToFind.length !== 0) 
					? fetchData(messagesInsideByNick, [Number(chatId), userToFind])
					: false
			]);

			const lastElementsByText = await getLastElements(messagesWithText, numberToDisplay);
			const lastElementsByNick = await getLastElements(messagesFromSender, numberToDisplay);
			
			return res.status(200).json({
				data: {
					messageByNick: messagesFromSender || null,
					messageByText: lastElementsByText || null
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
						
			const numberToDisplay = 10 // from request: initially ask 10 items, "show more" ask "previos_amount +10"

			const textToFind = ("string from request").trim(); // from request body: part of text
			const userToFind = ("string from request").trim(); // from request body: part of nickName
			
			const findAmong = '' // from request body: allJoinedChats, groupJoinedChats, privateJoinedChats



			// const [messagesWithText, messagesFromSender] = await Promise.all([
			// 	(!!textToFind && textToFind.length !== 0) 
			// 		? fetchData(messagesInsideByText, [Number(chatId), textToFind]) 
			// 		: false,
			// 	(!!userToFind && userToFind.length !== 0) 
			// 		? fetchData(messagesInsideByNick, [Number(chatId), userToFind])
			// 		: false
			// ]);

			// const lastElementsByText = await getLastElements(messagesWithText, numberToDisplay);
			// const lastElementsByNick = await getLastElements(messagesFromSender, numberToDisplay);
			

			return res.status(200).json({
				data: {
					// allJoinedChats: {
					// 	allMessageByNick,
					// 	allMessageByText
					// },
					// groupJoinedChats: {
					// 	groupMessageByNick,
					// 	groupMessageByText
					// },
					// privateJoinedChats: {
					// 	privateMessageByNick,
					// 	privateMessageByText
					// },
				}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'messageInList');
    }
}