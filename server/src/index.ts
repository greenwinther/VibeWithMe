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
import { Server } from "socket.io";
import { cleanupStaleRooms } from "./lib/cleanup";
import { prisma } from "./lib/prisma";
import roomsRouter from "./routes/rooms";
import usersRouter from "./routes/users";
import youtubeRouter from "./routes/youtube";
import { initSockets } from "./socket/index";

// Initialize Express app and HTTP server
const app = express();
const httpServer = http.createServer(app);

// DEV: allow any origin
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);
app.use(express.json());

// Healthcheck endpoint — Responds with a simple message to confirm server is up
const healthcheck: RequestHandler = (_req, res) => {
	res.send("Socket.IO server is running");
};
app.get("/", healthcheck);

// Mount the rooms routes
app.use("/rooms", roomsRouter);

// Mount the youtube search routes
app.use("/youtube-search", youtubeRouter);

// Mount the users routes
app.use("/users", usersRouter);

// Initialize Socket.IO for real-time communication
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type"],
		credentials: true,
	},
});
initSockets(io);

// Start HTTP server - Listen on PORT - Create a default "Test Room" if none exist
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
httpServer.listen(PORT, "0.0.0.0", async () => {
	console.log(`Server listening on http://0.0.0.0:${PORT}`);

	// Run cleanup immediately, then every hour
	cleanupStaleRooms().catch(console.error);
	setInterval(() => {
		cleanupStaleRooms().catch(console.error);
	}, 1000 * 60); // 60 seconds
	// 1000 * 60 * 60 is 1h

	// Bootstrap: create a sample room for development if empty
	if ((await prisma.room.count()) === 0) {
		const room = await prisma.room.create({
			data: { name: "Test Room", isPublic: true },
		});
		console.log("Created test room:", room.id);
	}
});
