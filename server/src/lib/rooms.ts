/**
 * Database helper functions for room operations:
 * - createRoom: create a new room record
 * - listPublicRooms: fetch a list of public rooms with selected fields
 * Additional helpers (getRoom, addSong, postMessage) to be implemented.
 */

import type { Room } from "@prisma/client";
import { prisma } from "./prisma";

// Create a new room in the database
export async function createRoom(name: string, isPublic: boolean): Promise<Room> {
	return prisma.room.create({ data: { name, isPublic } });
}

// List public rooms, returning only the PublicRoom fields
export async function listPublicRooms(): Promise<
	Array<
		Pick<Room, "id" | "name" | "createdAt" | "lastActive" | "currentVideoPosition" | "currentVideoTime">
	>
> {
	return prisma.room.findMany({
		where: { isPublic: true },
		select: {
			id: true,
			name: true,
			createdAt: true,
			lastActive: true,
			currentVideoPosition: true,
			currentVideoTime: true,
		},
		orderBy: { lastActive: "desc" },
	});
}

// Fetch a room by ID
export async function getRoom(id: string) {
	return prisma.room.findUnique({ where: { id } });
}

// TODO: addSong, removeSong, postMessage, etc.
