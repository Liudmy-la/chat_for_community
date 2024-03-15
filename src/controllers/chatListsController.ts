import { Request, Response } from "express";

import {getArray, getCommonChats, getUser, getPrivCollocutors, chatParticipants, allUsers} from "../utils/dbConnectFunctions";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";

 //---------------------------------------------------------

export async function chatsInfo (req: Request, res: Response) {
	try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser

			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}

			const userId = await getUser(userEmail);

			const privChatArray = await getArray(true, Number(userId));
			const groupChatArray = await getArray(false, Number(userId));
			
			const commonChats = await getCommonChats();

			if (commonChats.length === 0) {
				return res.status(400).json({
					message: `No Common Chats Available `,
				})
			}
		
			return res.status(200).json({
				data: {
					privChats: privChatArray,
					groupChats: groupChatArray,
					commonChats: commonChats,
				}
			})

		});
	} catch (error: any) {
		handleErrors(error, res, 'chatsInfo');
    }
};

export async function usersInfo (req: Request, res: Response) {
	try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser

			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}
			
			const chatId: number = Number(req.query.id);

			const allAppUsers: {userId: number, userNic: string}[] = await allUsers();

			const chatUsers = await chatParticipants(chatId);

			const userId = await getUser(userEmail);
			const allCollocutors: ({chatId: number, user: string} | null)[] = await getPrivCollocutors(Number(userId));

			return res.status(200).json({
				data: {
					allAppUsers,
					chatUsers,
					allCollocutors
				}
			})

		});
	} catch (error: any) {
		handleErrors(error, res, 'usersInfo');
    }
};