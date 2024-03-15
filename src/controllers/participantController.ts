import { Request, Response } from "express";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";
import { WebSocketClient } from "websocket/connectWebsocket";
import { setWebSocket } from "websocket/setWebSocket";
import { chatParticipants, getChatData, getUser, memberDelete } from "utils/dbConnectFunctions";


export async function openChat (ws: WebSocketClient, req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}
			
			const chat_id = 102; //from request
			const is_private = false; //from request

			// NEW WebSocket connection
			const myWS: WebSocket | undefined = await setWebSocket(chat_id, is_private, userEmail);

			if (!myWS) {
				return res.status(500).json({
					message: `Error establishing connection with <<${chat_id}>>`
				})
			}

			const participants: {userId: number, userNic: string}[] = await chatParticipants(chat_id);

			const chatData = await getChatData(Number(chat_id));

			return res.status(200).json({
				data: {
					currentWebsocket: myWS,
					chatData,
					participants
				}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'isParticipant');
    }
}

export async function deleteParticipant (req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			};
			
			const chat_id = 102; //from request
			
			const user = await getUser(userEmail);
			const user_id = user !== null ? user.userId : null

			const result = user_id !== null ? await memberDelete(Number(user_id), Number(chat_id)) : false;
			if (result === false) {
				throw Error(`Can't find user data.`)
			}
			
			if (result.length !== 0) {
				return res.status(500).json({
					message: `Can't execute this request.`
				})
			}

			return res.status(200).json({
				message: `You have left <<${chat_id}>> chat.`
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'deleteParticipant');
    }
}