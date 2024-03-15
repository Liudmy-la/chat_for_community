import { Request, Response } from "express";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";
import { WebSocketClient } from "websocket/connectWebsocket";
import { setWebSocket } from "websocket/setWebSocket";
import { getUser, memberDelete } from "utils/dbConnectRoutesFunctions";


export async function isParticipant (ws: WebSocketClient, req: Request, res: Response) {
    try {
		authenticateUser(req, res, async () => {
			// const userEmail = req.userEmail;	
			const userEmail: string = 'example@box'; // result of authenticateUser
			
			if (userEmail === undefined) {
				return res.status(401).json({ error: "Invalid or missing user email" });
			}
			
			let chat_id = 102; //from request
			let is_private = false; //from request


			// NEW WebSocket connection
			let mywsServer = setWebSocket(chat_id, is_private, userEmail);




			return res.status(200).json({
				data: {}
			})
		});

	} catch (error: any) {
		handleErrors(error, res, 'isParticipant');
    }
}

export async function deleteParticipant (ws: WebSocketClient, req: Request, res: Response) {
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