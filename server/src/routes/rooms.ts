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

// fetch metadata for a single room
const getRoom: RequestHandler<{ id: string }, RoomDTO | ErrorResponse> = async (req, res) => {
	const { id } = req.params;
	const record = await prisma.room.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			isPublic: true,
			createdAt: true,
			lastActive: true,
			currentVideoPosition: true,
			currentVideoTime: true,
			_count: { select: { participants: true } },
		},
	});
	if (!record) {
		const err: ErrorResponse = { error: "Room not found" };
		res.status(404).json(err);
		return;
	}
	const dto: RoomDTO = {
		id: record.id,
		name: record.name,
		isPublic: record.isPublic,
		createdAt: record.createdAt.toISOString(),
		lastActive: record.lastActive.toISOString(),
		currentVideoPosition: record.currentVideoPosition,
		currentVideoTime: record.currentVideoTime,
		participantCount: record._count.participants,
	};
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
router.get("/:id", getRoom);
router.post("/", createRoom);

export default router;
