import type { Room } from "@prisma/client";

export type PublicRoom = Pick<
	Room,
	"id" | "name" | "createdAt" | "lastActive" | "currentVideoPosition" | "currentVideoTime"
>;

// Body payload for creating a room
export interface CreateRoomBody {
	name: string;
	isPublic: boolean;
}

export type CreateRoomSuccess = Room;

export interface ErrorResponse {
	error: string;
}

export type CreateRoomResponse = CreateRoomSuccess | ErrorResponse;
