import cors from "cors";
import dotenv from "dotenv";
import express from "express";
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
app.use("/", express.static(path.resolve(__dirname, './client/index.html')))

const port = process.env.PORT || 7001;
const myServer = app.listen(port, () => { console.log(`Server is running on: http://localhost:${port}`)} );

const wsServer = new WebSocket.Server({ noServer: true });

myServer.on("upgrade", async function upgrade(request, socket, head) {
	wsServer.handleUpgrade(request, socket, head, function done(ws: WebSocket) {
		wsServer.emit('connection', ws, request);
	});
}); 

wsServer.on('connection', function (ws: WebSocket) {  
	ws.on('message', function (msg: string) {
		const receivedObj = JSON.parse(msg); //	console.log('Received Obj: ', receivedObj);

		// Broadcast the message to all clients
		wsServer.clients.forEach(function each (client: WebSocketClient) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(receivedObj));}
		});
	});
});

export default app;