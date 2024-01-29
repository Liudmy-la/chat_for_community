import cors from "cors";
import dotenv from "dotenv";
import express, {Request, Response} from "express";
import WebSocket from "ws";
import path from "path";
import routerAll from "./routes/routerAll";
import { swaggerRouter } from "./swagger/router";

interface WebSocketClient {
	send: (data: WebSocket.Data) => void;
	readyState: number;
}

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/", routerAll);
app.use("/api_docs", swaggerRouter);

app.use("/chat", express.static(path.resolve(__dirname, '../src/client'), {
	setHeaders: (res) => res.setHeader('Content-Type', 'text/html')
}));

const port = process.env.PORT || 7001;
const myServer = app.listen(port, () => { console.log(`Server is running on: http://localhost:${port}`)} );

const wsServer = new WebSocket.Server({ noServer: true });

myServer.on("upgrade", async function upgrade(request, socket, head) {
	wsServer.handleUpgrade(request, socket, head, function done(ws: WebSocket) {
		wsServer.emit('connection', ws, request);
	});
}); 

const allChats: Map<string, Array<WebSocket>> = new Map();

debugger
wsServer.on('connection', (ws: WebSocket, req: Request) => {
console.log(`CHECK: `, req.url)

	// Join a specific chat
	const chat: string = 'general';
	if (!allChats.get(chat)) {
		allChats.set(chat, []);
	}
	
	let chatArray: Array<WebSocket> | undefined = allChats.get(chat);
	if (chatArray) {
		chatArray.push(ws);
	}
// console.log('GENERAL chat :', allChats.get('general'))
	
	ws.on('message', function (msg: string) {
		const receivedObj = JSON.parse(msg); //	console.log('Received Obj: ', receivedObj);

		// Broadcast the message to all clients of current chat
		if (chatArray) {
			chatArray.forEach((client: WebSocketClient) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(receivedObj));}
			});
		}
	});

	ws.on('close', () => {
		// handle client disconnection: if WS-connection will be closed by the client or due to some error
		if (chatArray) {
			chatArray = chatArray.filter((member) => member !== ws);
		}
	});	
});  

export default app;