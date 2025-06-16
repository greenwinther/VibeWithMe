import { PlaylistItemDTO, VideoDTO } from "@types";
import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

export function registerPlaylistHandlers(io: Server, socket: Socket) {
	// Fetch playlist
	socket.on("playlist:fetch", async ({ roomId }) => {
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

		const queue: PlaylistItemDTO[] = rows.map((v) => ({
			position: v.position,
			video: {
				videoId: v.videoId,
				title: v.title,
				thumbnail: v.thumbnail,
				duration: v.duration,
			},
			addedBy: { id: v.addedBy.id, name: v.addedBy.name },
		}));

		socket.emit("playlist:update", queue);
	});

	// Add and broadcast updated queue
	socket.on(
		"video:add",
		async ({ roomId, userId, video }: { roomId: string; userId: string; video: VideoDTO }) => {
			// Add to DB
			const agg = await prisma.video.aggregate({ where: { roomId }, _max: { position: true } });
			const nextPosition = (agg._max.position ?? -1) + 1;
			await prisma.video.create({
				data: {
					videoId: video.videoId,
					title: video.title,
					thumbnail: video.thumbnail,
					duration: video.duration ?? 0,
					position: nextPosition,
					room: { connect: { id: roomId } },
					addedBy: { connect: { id: userId } },
				},
			});

			// Re-fetch queue
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

			const queue: PlaylistItemDTO[] = rows.map((v) => ({
				position: v.position,
				video: {
					videoId: v.videoId,
					title: v.title,
					thumbnail: v.thumbnail,
					duration: v.duration,
				},
				addedBy: { id: v.addedBy.id, name: v.addedBy.name },
			}));

			// Broadcast to *all* clients in the room
			io.to(roomId).emit("playlist:update", queue);
		}
	);
}
