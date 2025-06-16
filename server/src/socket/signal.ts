import type { Server, Socket } from "socket.io";

export function registerSignalHandler(io: Server, socket: Socket) {
	socket.on("signal", (data) => {
		io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
	});
}
