import { socket } from "@/server/src/lib/socket";
import type { RoomDTO, RoomParticipantDTO } from "@/server/types";
import { useLocalSearchParams } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

interface RoomState {
	room?: RoomDTO;
	participants: RoomParticipantDTO[];
	loading: boolean;
	error: Error | null;
	joinRoom: (userId: string, userName: string) => void;
}

const RoomContext = createContext<RoomState | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { id: roomId } = useLocalSearchParams<{ id: string }>();
	const [room, setRoom] = useState<RoomDTO>();
	const [participants, setParticipants] = useState<RoomParticipantDTO[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!roomId) return;
		// fetch room metadata once
		fetch(`http://localhost:4000/rooms/${roomId}`)
			.then((res) => res.json())
			.then((r: RoomDTO) => setRoom(r))
			.catch(setError)
			.finally(() => setLoading(false));

		// subscribe to participant updates, if you emit them
		socket.on("user-joined", (p: RoomParticipantDTO) => {
			setParticipants((ps) => [...ps, p]);
		});

		// initial participants
		// you could fetch GET /rooms/:id/participants if you have that API

		return () => {
			socket.off("user-joined");
		};
	}, [roomId]);

	const joinRoom = (userId: string, userName: string) => {
		if (roomId) {
			socket.emit("join-room", { roomId, userId, userName });
		}
	};

	return (
		<RoomContext.Provider value={{ room, participants, loading, error, joinRoom }}>
			{children}
		</RoomContext.Provider>
	);
};

export function useRoom() {
	const ctx = useContext(RoomContext);
	if (!ctx) throw new Error("useRoom must be inside RoomProvider");
	return ctx;
}
