/**
 * Initializes Socket.IO event handlers for real-time interactions:
 * - join-room: track users and emit initial state (playback, chat, playlist)
 * - chat:message & chat:fetch: handle chat
 * - video:add & playlist:fetch: handle playlist
 * - play-pause, seek, video:advance: handle playback syncing
 * - signal: forward WebRTC signals
 */

import type { ChatMessageDTO, VideoDTO } from "@types";
import { Server, Socket } from "socket.io";
import { prisma } from "./lib/prisma";
import { postMessage } from "./lib/rooms";

export function initSockets(io: Server) {
	io.on("connection", (socket: Socket) => {
		console.log(`Client connected [id=${socket.id}]`);

		// join-room: adds the socket to a room, upserts user & participant, then emits state
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
				const videos = await prisma.video.findMany({
					where: { roomId },
					orderBy: { position: "asc" },
					select: { videoId: true, title: true, thumbnail: true, duration: true },
				});
				const playlist: VideoDTO[] = videos.map((v) => ({
					videoId: v.videoId,
					title: v.title,
					thumbnail: v.thumbnail,
					duration: v.duration,
				}));
				socket.emit("playlist:update", playlist);

				// Notify others that a new user joined
				socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });
			}
		);

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
				const msg = await postMessage(roomId, userId, text);
				io.to(roomId).emit("chat:message", msg);
			}
		);

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
