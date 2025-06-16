import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { createMessage } from "../lib/rooms";

export function registerChatHandlers(io: Server, socket: Socket) {
	// chat: fetch history
	socket.on("chat:fetch", async ({ roomId }: { roomId: string }) => {
		const messages = await prisma.message.findMany({
			where: { roomId },
			orderBy: { createdAt: "asc" },
			include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
		});
		socket.emit(
			"chat:history",
			messages.map((msg) => ({
				id: msg.id,
				text: msg.text,
				createdAt: msg.createdAt.toISOString(),
				roomId: msg.roomId,
				sender: { id: msg.sender.id, name: msg.sender.name, avatarUrl: msg.sender.avatarUrl },
			}))
		);
	});

	// chat:message — save and broadcast
	socket.on(
		"chat:message",
		async ({ roomId, userId, text }: { roomId: string; userId: string; text: string }) => {
			const msg = await createMessage(roomId, userId, text);
			io.to(roomId).emit("chat:message", msg);
		}
	);
}
