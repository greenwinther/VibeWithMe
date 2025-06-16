import { ChatMessageDTO, PlaylistItemDTO } from "@types";
import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

export function registerRoomHandlers(io: Server, socket: Socket) {
	socket.on(
		"join-room",
		async ({ roomId, userId, userName }: { roomId: string; userId: string; userName?: string }) => {
			const nameToUse = userName?.trim() || "Guest";

			// Join Socket.IO room
			socket.join(roomId);

			// Update room lastActive timestamp
			await prisma.room.update({ where: { id: roomId }, data: { lastActive: new Date() } });

			// Upsert user record
			await prisma.user.upsert({
				where: { id: userId },
				create: { id: userId, name: nameToUse },
				update: { name: nameToUse },
			});

			// Upsert participant record
			await prisma.roomParticipant.upsert({
				where: { userId_roomId: { userId, roomId } },
				create: { userId, roomId },
				update: {},
			});

			// Emit current room playback state only to this socket
			const state = await prisma.room.findUnique({
				where: { id: roomId },
				select: { currentVideoPosition: true, currentVideoTime: true },
			});
			if (state) {
				socket.emit("room:state", {
					videoIndex: state.currentVideoPosition,
					time: state.currentVideoTime,
				});
			}

			// Emit chat history
			const history = await prisma.message.findMany({
				where: { roomId },
				orderBy: { createdAt: "asc" },
				include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
			});
			const chatHistory: ChatMessageDTO[] = history.map((msg) => ({
				id: msg.id,
				text: msg.text,
				createdAt: msg.createdAt.toISOString(),
				roomId: msg.roomId,
				sender: { id: msg.sender.id, name: msg.sender.name, avatarUrl: msg.sender.avatarUrl },
			}));
			socket.emit("chat:history", chatHistory);

			// Emit playlist
			const rows = await prisma.video.findMany({
				where: { roomId },
				orderBy: { position: "asc" },
				select: {
					position: true,
					videoId: true,
					title: true,
					thumbnail: true,
					duration: true,
					addedBy: { select: { id: true, name: true } },
				},
			});
			const playlist: PlaylistItemDTO[] = rows.map((v) => ({
				position: v.position,
				video: {
					videoId: v.videoId,
					title: v.title,
					thumbnail: v.thumbnail,
					duration: v.duration,
				},
				addedBy: {
					id: v.addedBy.id,
					name: v.addedBy.name,
				},
			}));
			socket.emit("playlist:update", playlist);

			// Notify others that a new user joined
			socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });
		}
	);
}
