/**
 * This mirrors exactly what your server POST /rooms returns
 * and what GET /rooms emits in each array element.
 */

// Pull in the Prisma model types
import { Message, Room, RoomParticipant, User, Video } from "@prisma/client";

// Re-export the raw models
export type { Message, Room, RoomParticipant, User, Video };

// What the client sends to identify a user (e.g. after login or on socket connect)
export type UserDTO = Pick<User, "id" | "name" | "avatarUrl">;

export type VideoDTO = { videoId: string; title: string; thumbnail: string; duration?: number };

export interface ChatMessageDTO {
	id: string;
	text: string;
	createdAt: string;
	roomId: string;
	sender: {
		id: string;
		name: string;
		avatarUrl: string | null;
	};
}

export type PlaylistItemDTO = { position: number; video: VideoDTO; addedBy: Pick<User, "id" | "name"> };

export type RoomParticipantDTO = Pick<RoomParticipant, "userId" | "roomId">;

// Room shapes
export interface RoomDTO {
	id: string;
	name: string;
	isPublic: boolean;
	createdAt: string;
	lastActive: string;
	currentVideoPosition: number;
	currentVideoTime: number;
	participantCount: number;
}

export type PublicRoomDTO = Omit<RoomDTO, "isPublic">;

// Request bodies
export interface CreateRoomBody {
	name: string;
	isPublic: boolean;
}

export interface JoinRoomBody {
	roomId: string;
	userId: string;
	userName: string;
}

// Standard error
export interface ErrorResponse {
	error: string;
}

// response from POST /rooms
export type CreateRoomResult = RoomDTO | ErrorResponse;
