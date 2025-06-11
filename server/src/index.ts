/**
 * Entry point for the VibeWithMe server.
 * - Bootstraps Express app
 * - Configures middleware (CORS, JSON parsing)
 * - Mounts REST routes
 * - Initializes Socket.IO for real-time events
 * - Starts HTTP server and creates a test room if none exist
 */

import cors from "cors";
import express, { RequestHandler } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./lib/prisma";
import roomsRouter from "./routes/rooms";
import { initSockets } from "./socket";

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware configuration
app.use(cors({ origin: "http://localhost:19006" }));
app.use(express.json());

// Healthcheck endpoint — Responds with a simple message to confirm server is up
const healthcheck: RequestHandler = (_req, res) => {
	res.send("Socket.IO server is running");
};
app.get("/", healthcheck);

// Mount your rooms routes
app.use("/rooms", roomsRouter);

// Initialize Socket.IO for real-time communication
const io = new SocketIOServer(server, {
	cors: { origin: "http://localhost:19006" },
});
initSockets(io);

// Start HTTP server - Listen on PORT - Create a default "Test Room" if none exist
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
server.listen(PORT, async () => {
	console.log(`Server listening on http://localhost:${PORT}`);

	// Bootstrap: create a sample room for development if empty
	if ((await prisma.room.count()) === 0) {
		const room = await prisma.room.create({
			data: { name: "Test Room", isPublic: true },
		});
		console.log("Created test room:", room.id);
	}
});
