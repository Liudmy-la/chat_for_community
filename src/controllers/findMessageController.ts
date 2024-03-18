import { Request, Response } from "express";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";
import {connect} from '../db/dbConnect';
import {getUser, getPreviousMessages, getСonnectTime, messagesInsideByChunk, searchMessagesByChunk} from "../utils/dbConnectFunctions";
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

			const findBy: 'text' | 'user' = req.body.option  // from request body: 'text' or 'user'
			const chunkToFind = ("string from request").trim(); // from request body: part of text or nickName
			
			const messagesWithChunk = 
				(!!chunkToFind && chunkToFind.length !== 0) 
					? await fetchData(messagesInsideByChunk, [Number(chatId), findBy, chunkToFind]) 
					: false ;

			const lastElementsByChunk = await getLastElements(messagesWithChunk, numberToDisplay);
			
			return res.status(200).json({
				data: {
					messageByText: lastElementsByChunk,
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
			
			const user: {userId: number, userNick: string} | null = await getUser(userEmail);
			if (user === null) {
				return res.status(401).json({ error: `Can't find user data.` });
			};

			const userId = user.userId;
						
			const numberToDisplay = 20 // from request: initially ask 10 items, "show more" ask "previos_amount +10"
			const findBy: 'text' | 'user' = req.body.option_1  // from request body: 'text' or 'user'
			const findAmong: 'groupJoinedChats' | 'privateJoinedChats' = req.body.option_2 // from request body: groupJoinedChats, privateJoinedChats

			const chunkToFind = ("string from request").trim(); // from request body: part of text or nickName

			const messagesWithChunk = 
			(!!chunkToFind && chunkToFind.length !== 0) 
				? await fetchData(searchMessagesByChunk, [Number(userId), findBy, findAmong, chunkToFind]) 
				: false ;

			const lastElementsByChunk = await getLastElements(messagesWithChunk, numberToDisplay);	

			return res.status(200).json({
				data: {
					messageByText: lastElementsByChunk,
				}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'messageInList');
    }
}