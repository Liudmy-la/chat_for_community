import cors from "cors";
import dotenv from "dotenv";
import express, {Request, Response} from "express";
import WebSocket from "ws";
import path from "path";
import routerAll from "./routes/routerAll";
import { swaggerRouter } from "./swagger/router";

// import { verifyToken } from './utils/generateToken';
dotenv.config();

interface WebSocketClient {
	send: (data: WebSocket.Data) => void;
	readyState: number;
}

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

export const allChats: Map<string, Array<WebSocket>> = new Map();

wsServer.on('connection', (ws: WebSocket, req: Request) => {	
	const url = req.url;
	let chatName: string;
	let chatArray: Array<WebSocket> | undefined;

	if(url.startsWith('/chatting')) {
		chatName = url.substring(13);
		if (!allChats.get(chatName)) {
			allChats.set(chatName, []);
		}
	
		chatArray = allChats.get(chatName);		
		if (chatArray && !chatArray.includes(ws)) {
			chatArray.push(ws); // console.log(`ADD new WS`, chatArray.length);
			allChats.set(chatName, chatArray);

			ws.send(JSON.stringify({text: `Welcome in << ${chatName} >> !`}));
		}
	}
	
	ws.on('message', function (msg: string) {
		const receivedObj = JSON.parse(msg);
		// Broadcast the message to all clients of current chat
		if (chatArray) {
			chatArray.forEach((client: WebSocketClient) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(receivedObj));}
			});
		}
	});

	ws.on('close', (code, reason) => {
		// handle client disconnection: if WS-connection will be closed by the client or due to some error
		if (chatArray) {
			chatArray = chatArray.filter((member) => member !== ws); // console.log(`after`, chatArray?.length)
			allChats.set(chatName, chatArray);
		}
	});
}); 

export default app;