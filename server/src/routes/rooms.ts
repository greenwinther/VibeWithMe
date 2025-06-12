/**
 * Express Router for room-related REST endpoints:
 * - GET /rooms: list all public rooms
 * - POST /rooms: create a new room
 */

// server/src/routes/rooms.ts
import { RequestHandler, Router } from "express";
import * as roomLib from "../lib/rooms";

// Import your shared API‐contract types
import type { CreateRoomBody, CreateRoomResponse, ErrorResponse, PublicRoomDTO } from "@shared";

const router = Router();

// GET /rooms — list public rooms
const listRooms: RequestHandler<{}, PublicRoomDTO[], {}> = async (_req, res) => {
	// Fetch raw Room records and map to your DTO shape
	const rooms = await roomLib.listPublicRooms();
	const dto = rooms.map((r) => ({
		id: r.id,
		name: r.name,
		createdAt: r.createdAt.toISOString(),
		lastActive: r.lastActive.toISOString(),
		currentVideoPosition: r.currentVideoPosition,
		currentVideoTime: r.currentVideoTime,
	}));
	res.json(dto);
};

// POST /rooms — create a new room
const createRoom: RequestHandler<{}, CreateRoomResponse, CreateRoomBody> = async (req, res) => {
	const { name, isPublic } = req.body;
	if (!name || typeof isPublic !== "boolean") {
		const err: ErrorResponse = { error: "Invalid input" };
		res.status(400).json(err);
		return;
	}

	const room = await roomLib.createRoom(name, isPublic);
	// Convert Dates to ISO strings for the DTO
	const response: PublicRoomDTO & { isPublic: boolean } = {
		id: room.id,
		name: room.name,
		isPublic: room.isPublic,
		createdAt: room.createdAt.toISOString(),
		lastActive: room.lastActive.toISOString(),
		currentVideoPosition: room.currentVideoPosition,
		currentVideoTime: room.currentVideoTime,
	};
	res.status(201).json(response);
};

router.get("/", listRooms);
router.post("/", createRoom);

export default router;
