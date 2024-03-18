import { Request, Response } from "express";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";
import { getUser, getChatByNickname } from "../utils/dbConnectFunctions";


export async function groupByCaption (req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}
			
			const findBy = '' // from request body: text, nickName




			return res.status(200).json({
				data: {}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'groupByCaption');
    }
}

export async function joinedGroupByCaption (req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}
			
			const findBy = '' // from request body: nickName, text - in joined chats; heading, description - all chats 



			return res.status(200).json({
				data: {}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'joinedGroupByCaption');
    }
}

export async function chatByNickname (req: Request, res: Response) {
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
			
			const chunkToFind = ("string from request").trim(); // from request body: part of nickName

			const chatResult = await getChatByNickname(userId, chunkToFind)

			return res.status(200).json({
				data: {
					chatResult
				}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'chatByNickname');
    }
}