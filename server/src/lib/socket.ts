import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

export const socket: Socket = io(SERVER_URL, {
	transports: ["websocket"],
});
