import WebSocket from "ws"; // npm install express ws typescript ts-node nodemon --save  +  npm i --save-dev @types/ws
import express, { Request, Response } from "express";
import http from "http";
import path from "path";

const app = express();
const myServer = http.createServer(app);
const wsServer = new WebSocket.Server({ noServer: true });

app.use("/", express.static(path.resolve(__dirname, '../../../front/travel-chat/travel-chat/src/pages/client/index.html')))

interface WebSocketClient {
	send: (data: WebSocket.Data) => void;
	readyState: number;
}

wsServer.on('connection', function (ws: WebSocket) {  
	ws.on('message', function (msg: string) {
		const receivedObj = JSON.parse(msg);
		console.log('Received Obj: ', receivedObj);

		// Broadcast the message to all clients
		wsServer.clients.forEach(function each (client: WebSocketClient) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(receivedObj));

				console.log('Obj to give back :', JSON.stringify(receivedObj))
			}
		});
	});
});


myServer.on("upgrade", async function upgrade(request, socket, head) {
	wsServer.handleUpgrade(request, socket, head, function done(ws: WebSocket) {
		wsServer.emit('connection', ws, request);
	});
}); 


export const listening = (req: Request, res: Response) => {
	const { port } = req.query
	// const PORT = port
		
	const PORT = 3001;

	myServer.listen(PORT, () => {
		return res.status(200).json(`Connected online to the chat on the port: ${PORT}`)
	});
}