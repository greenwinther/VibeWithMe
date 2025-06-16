/**
 * Initializes Socket.IO event handlers for real-time interactions:
 * - join-room: track users and emit initial state (playback, chat, playlist)
 * - chat:message & chat:fetch: handle chat
 * - video:add & playlist:fetch: handle playlist
 * - play-pause, seek, video:advance: handle playback syncing
 * - signal: forward WebRTC signals
 */

import { Server, Socket } from "socket.io";
import { registerChatHandlers } from "./chat";
import { registerPlaybackHandlers } from "./playback";
import { registerPlaylistHandlers } from "./playlist";
import { registerRoomHandlers } from "./room";
import { registerSignalHandler } from "./signal";

export function initSockets(io: Server) {
	io.on("connection", (socket: Socket) => {
		console.log(`Client connected [id=${socket.id}]`);

		registerRoomHandlers(io, socket);
		registerChatHandlers(io, socket);
		registerPlaylistHandlers(io, socket);
		registerPlaybackHandlers(io, socket);
		registerSignalHandler(io, socket);

		// disconnect: logs when a client disconnects
		socket.on("disconnect", () => {
			console.log(`Client disconnected [id=${socket.id}]`);
		});
	});
}
