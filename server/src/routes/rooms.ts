/**
 * Express Router for room-related REST endpoints:
 * - GET /rooms: list all public rooms
 * - POST /rooms: create a new room
 */

import { CreateRoomBody, ErrorResponse, PublicRoomDTO, RoomDTO } from "@types";
import { RequestHandler, Router } from "express";
import { prisma } from "src/lib/prisma";
import * as roomLib from "../lib/rooms";

const router = Router();

// List all public rooms
const listRooms: RequestHandler<{}, PublicRoomDTO[]> = async (_req, res) => {
	const rows = await roomLib.listPublicRooms();

	const dto: PublicRoomDTO[] = rows.map((room) => ({
		id: room.id,
		name: room.name,
		createdAt: room.createdAt.toISOString(),
		lastActive: room.lastActive.toISOString(),
		currentVideoPosition: room.currentVideoPosition,
		currentVideoTime: room.currentVideoTime,
		participantCount: room.participantCount,
	}));

	res.json(dto);
};

// Create a new room
const createRoom: RequestHandler<{}, RoomDTO | ErrorResponse, CreateRoomBody> = async (req, res) => {
	const { name, isPublic } = req.body;

	if (!name || typeof isPublic !== "boolean") {
		const err: ErrorResponse = { error: "Invalid input" };
		res.status(400).json(err);
		return;
	}

	// Create the room
	const room = await roomLib.createRoom(name, isPublic);

	// Fetch the participant count
	const participantCount = await prisma.roomParticipant.count({
		where: { roomId: room.id },
	});

	// Build your RoomDTO
	const response: RoomDTO = {
		id: room.id,
		name: room.name,
		isPublic: room.isPublic,
		createdAt: room.createdAt.toISOString(),
		lastActive: room.lastActive.toISOString(),
		currentVideoPosition: room.currentVideoPosition,
		currentVideoTime: room.currentVideoTime,
		participantCount,
	};

	res.status(201).json(response);
};

router.get("/", listRooms);
router.post("/", createRoom);

export default router;
