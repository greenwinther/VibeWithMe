/**
 * Database helper functions for room operations:
 * - createRoom: create a new room record
 * - listPublicRooms: fetch a list of public rooms with selected fields
 * - getRoom: fetch a room by ID
 * - postMessage: create and return a chat message with sender info
 */

import type { Room } from "@prisma/client";
import type { ChatMessageDTO } from "@types";
import { prisma } from "./prisma";

export type PublicRoomRow = Pick<
	Room,
	"id" | "name" | "createdAt" | "lastActive" | "currentVideoPosition" | "currentVideoTime"
> & {
	participantCount: number;
};

// Create a new room in the database.
export async function createRoom(name: string, isPublic: boolean): Promise<Room> {
	// returns the created Room record.
	return prisma.room.create({ data: { name, isPublic } });
}

// List all public rooms with the core fields needed for listing
export async function listPublicRooms(): Promise<PublicRoomRow[]> {
	return prisma.room
		.findMany({
			where: { isPublic: true },
			select: {
				id: true,
				name: true,
				createdAt: true,
				lastActive: true,
				currentVideoPosition: true,
				currentVideoTime: true,
				_count: {
					select: { participants: true },
				},
			},
			orderBy: { lastActive: "desc" },
		})
		.then((rooms) =>
			rooms.map((r) => ({
				id: r.id,
				name: r.name,
				createdAt: r.createdAt,
				lastActive: r.lastActive,
				currentVideoPosition: r.currentVideoPosition,
				currentVideoTime: r.currentVideoTime,
				participantCount: r._count.participants,
			}))
		);
}

// Get a single room by ID.
export async function getRoom(id: string): Promise<Room | null> {
	// returns the Room record or null if not found.
	return prisma.room.findUnique({ where: { id } });
}

// Post (create) a chat message in a room and include sender info
export async function createMessage(roomId: string, userId: string, text: string): Promise<ChatMessageDTO> {
	const msg = await prisma.message.create({
		data: {
			room: { connect: { id: roomId } },
			sender: { connect: { id: userId } },
			text,
		},
		include: {
			sender: {
				select: { id: true, name: true, avatarUrl: true },
			},
		},
	});
	// returns the created message and sender payload (ChatMessageDTO).
	return {
		id: msg.id,
		text: msg.text,
		createdAt: msg.createdAt.toISOString(),
		roomId: msg.roomId,
		sender: {
			id: msg.sender.id,
			name: msg.sender.name,
			avatarUrl: msg.sender.avatarUrl,
		},
	};
}
