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

const allChats: Map<string, Array<WebSocket>> = new Map();

wsServer.on('connection', (ws: WebSocket, req: Request) => {	
	const url = req.url; //console.log(`CHECK: `, req.url)

	let chatName: string;
	let chatArray: Array<WebSocket> | undefined;

	if(url.startsWith('/chatting')) {
		chatName = url.substring(13)

		if (!allChats.get(chatName)) {
			allChats.set(chatName, []);
		}
	
		chatArray = allChats.get(chatName);
		if (chatArray) {
			chatArray.push(ws);
			ws.send(JSON.stringify({text: `Вітаю у каналі << ${chatName} >> !`}))
		}
	}
	
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