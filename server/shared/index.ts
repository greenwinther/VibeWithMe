/**
 * This mirrors exactly what your server POST /rooms returns
 * and what GET /rooms emits in each array element.
 */

// What the client sends to identify a user (e.g. after login or on socket connect)
export interface UserDTO {
	id: string;
	name: string;
	avatarUrl?: string;
}

// What the client receives when it lists rooms
export interface RoomDTO {
	id: string;
	name: string;
	isPublic: boolean;
	createdAt: string;
	lastActive: string;
	currentVideoPosition: number;
	currentVideoTime: number;
}

// When showing the lobby, you can omit `isPublic` because all rooms returned are public
export type PublicRoomDTO = Omit<RoomDTO, "isPublic">;

// The body you send to create a room
export interface CreateRoomBody {
	name: string;
	isPublic: boolean;
}

// The body you send to identify a user (e.g. on join-room)
export interface JoinRoomBody {
	roomId: string;
	userId: string;
}

// Standard error shape
export interface ErrorResponse {
	error: string;
}

// response from POST /rooms
export type CreateRoomResponse = RoomDTO | { error: string };
