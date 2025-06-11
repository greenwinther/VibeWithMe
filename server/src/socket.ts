/**
 * Defines Socket.IO event handlers for real-time interactions:
 * - Manages user connections and disconnections
 * - Handles joining rooms, broadcasting join events
 * - Relays signaling data between peers
 */

import { Server as IOServer } from "socket.io";
import { prisma } from "./lib/prisma";

// Initialize all socket event listeners
export function initSockets(io: IOServer) {
	io.on("connection", (socket) => {
		console.log(`Client connected [id=${socket.id}]`);

		// join-room: adds the socket to a room and notifies others
		socket.on("join-room", async (roomId: string) => {
			socket.join(roomId);
			await prisma.room.update({ where: { id: roomId }, data: { lastActive: new Date() } });
			socket.to(roomId).emit("user-joined", socket.id);
		});

		// signal: forwards WebRTC signaling data to a specific peer
		socket.on("signal", (data) => {
			io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
		});

		// disconnect: logs when a client disconnects
		socket.on("disconnect", () => {
			console.log(`Client disconnected [id=${socket.id}]`);
		});
	});
}
