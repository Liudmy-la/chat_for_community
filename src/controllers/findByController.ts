import { Request, Response } from "express";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";
import { getUser } from "utils/dbConnectRoutesFunctions";


export async function findInChat (req: Request, res: Response) {
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
				data: {}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'isParticipant');
    }
}

export async function findInList (req: Request, res: Response) {
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
				data: {}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'isParticipant');
    }
}