import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

export function registerPlaybackHandlers(io: Server, socket: Socket) {
	// playback controls
	socket.on("play-pause", async ({ roomId, playing }: { roomId: string; playing: boolean }) => {
		socket.to(roomId).emit("play-pause", { playing });
		await prisma.room.update({ where: { id: roomId }, data: { lastActive: new Date() } });
	});

	socket.on("seek", async ({ roomId, time }: { roomId: string; time: number }) => {
		socket.to(roomId).emit("seek", { time });
		await prisma.room.update({ where: { id: roomId }, data: { currentVideoTime: time } });
	});

	socket.on("video:advance", async ({ roomId, newIndex }: { roomId: string; newIndex: number }) => {
		io.to(roomId).emit("video:advance", { newIndex });
		await prisma.room.update({
			where: { id: roomId },
			data: { currentVideoPosition: newIndex, currentVideoTime: 0 },
		});
	});
}
