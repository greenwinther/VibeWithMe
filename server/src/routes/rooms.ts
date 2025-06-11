/**
 * Express Router for room-related REST endpoints:
 * - GET /rooms: list all public rooms
 * - POST /rooms: create a new room
 */

import { RequestHandler, Router } from "express";
import * as roomLib from "../lib/rooms";
import type { CreateRoomBody, CreateRoomResponse, ErrorResponse, PublicRoom } from "../types";

const router = Router();

// GET /rooms — list public rooms
const listRooms: RequestHandler<{}, PublicRoom[], {}> = async (_req, res) => {
	const rooms = await roomLib.listPublicRooms();
	res.json(rooms);
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
	res.status(201).json(room);
};

router.get("/", listRooms);
router.post("/", createRoom);

export default router;
