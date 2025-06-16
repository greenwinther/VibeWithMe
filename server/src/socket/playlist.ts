import { VideoDTO } from "@types";
import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

export function registerPlaylistHandlers(io: Server, socket: Socket) {
	// playlist fetch
	socket.on("playlist:fetch", async ({ roomId }: { roomId: string }) => {
		const videos = await prisma.video.findMany({
			where: { roomId },
			orderBy: { position: "asc" },
			select: { videoId: true, title: true, thumbnail: true, duration: true },
		});
		socket.emit(
			"playlist:update",
			videos.map((v) => ({
				videoId: v.videoId,
				title: v.title,
				thumbnail: v.thumbnail,
				duration: v.duration,
			}))
		);
	});

	// video:add — add and broadcast updated queue
	socket.on(
		"video:add",
		async ({ roomId, userId, video }: { roomId: string; userId: string; video: VideoDTO }) => {
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
			// re-emit full playlist
			socket.emit("playlist:fetch", { roomId });
		}
	);
}
