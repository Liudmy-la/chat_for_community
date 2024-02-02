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

interface ChatData {
	permission: string | null;
	welcome: string;
	participants: Array<WebSocket> | undefined;
}

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", routerAll);
app.use("/api_docs", swaggerRouter);

app.use("/chat", express.static(path.resolve(__dirname, '../src/client'), {
	setHeaders: (res) => res.setHeader('Content-Type', 'text/html')
}));

function checkSession () {
	// compare secure-key from session with secure-key from DB
	return true
}

const port = process.env.PORT || 7001;
const myServer = app.listen(port, () => { console.log(`Server is running on: http://localhost:${port}`)} );

const wsServer = new WebSocket.Server({ noServer: true });

myServer.on("upgrade", async function upgrade(request, socket, head) {
	wsServer.handleUpgrade(request, socket, head, function done(ws: WebSocket) {
		wsServer.emit('connection', ws, request);
	});
}); 

export const allChats: Map<string, ChatData> = new Map();

wsServer.on('connection', (ws: WebSocket, req: Request) => {	
	const url = req.url;

	let chatName: string;
	let chatData: ChatData | undefined;

	if(url.startsWith('/chat-of-')) {
		chatName = url.substring(9);
		if (!allChats.get(chatName)) {
			allChats.set(chatName, {
					permission: '',
					welcome: 'Hi there!',
					participants: []
				});
		}
	
		chatData = allChats.get(chatName);		
		if (chatData && chatData.participants && !chatData.participants.includes(ws)) {
			chatData.participants.push(ws); // console.log(`ADD new WS`, chatData.participants.length);
			allChats.set(chatName, chatData);

			ws.send(JSON.stringify({text: `${chatData.welcome} We all are in << ${chatName} >> `}));
		}
	} else if (url.startsWith('/priv-chat-of-')) {
		chatName = url.substring(14);
		if (!allChats.get(chatName)) {
			allChats.set(chatName, {
					permission: '',
					welcome: 'Hi there!',
					participants: []
				});
		}

		const isConfirmed = checkSession ()
	
		chatData = allChats.get(chatName);		
		if (chatData && chatData.participants && isConfirmed && !chatData.participants.includes(ws)) {
			chatData.participants.push(ws); // console.log(`ADD new WS`, chatData.participants.length);
			allChats.set(chatName, chatData);

			ws.send(JSON.stringify({text: `${chatData.welcome} We are << ${chatName} >> `}));
		}
	}
	
	ws.on('message', function (msg: string) {
		const receivedObj = JSON.parse(msg);
		// Broadcast the message to all clients of current chat
		if (chatData && chatData.participants) {
			chatData.participants.forEach((client: WebSocketClient) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(receivedObj));}
			});
		}
	});

	ws.on('close', (code, reason) => {
		// handle client disconnection: if WS-connection will be closed by the client or due to some error
		if (chatData && chatData.participants) {
			chatData.participants = chatData.participants.filter((member) => member !== ws); // console.log(`after`, chatArray?.length)
			allChats.set(chatName, chatData);
		}
	});
}); 

export default app;