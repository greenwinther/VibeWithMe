import { socket } from "@/server/src/lib/socket";
import { RoomDTO, RoomParticipantDTO } from "@/server/types";
import { useLocalSearchParams } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

interface RoomState {
	room?: RoomDTO;
	participants: RoomParticipantDTO[];
	loading: boolean;
	error: Error | null;

	// playback state & actions:
	isPlaying: boolean;
	currentTime: number;
	playPause: (playing: boolean) => void;
	seekPlayback: (time: number) => void;
	joinRoom: (userId: string, userName: string) => void;
}

const RoomContext = createContext<RoomState | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { id: roomId } = useLocalSearchParams<{ id: string }>();
	const [room, setRoom] = useState<RoomDTO>();
	const [participants, setParticipants] = useState<RoomParticipantDTO[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// playback
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);

	// fetch room metadata on mount
	useEffect(() => {
		if (!roomId) return;
		fetch(`http://localhost:4000/rooms/${roomId}`)
			.then((res) => res.json())
			.then((r: RoomDTO) => setRoom(r))
			.catch(setError)
			.finally(() => setLoading(false));

		// subscribe to participants
		socket.on("user-joined", (p: RoomParticipantDTO) => setParticipants((ps) => [...ps, p]));

		// initial playback state from server
		socket.on("room:state", ({ videoIndex, time }: { videoIndex: number; time: number }) => {
			setRoom((r) =>
				r
					? {
							...r,
							currentVideoPosition: videoIndex,
							currentVideoTime: time,
					  }
					: r
			);
			setCurrentTime(time);
		});

		// playback sync events
		socket.on("play-pause", ({ playing }: { playing: boolean }) => setIsPlaying(playing));
		socket.on("seek", ({ time }: { time: number }) => setCurrentTime(time));
		socket.on("video:advance", ({ newIndex }: { newIndex: number }) =>
			setRoom((r) => (r ? { ...r, currentVideoPosition: newIndex, currentVideoTime: 0 } : r))
		);

		return () => {
			socket.off("user-joined");
			socket.off("room:state");
			socket.off("play-pause");
			socket.off("seek");
			socket.off("video:advance");
		};
	}, [roomId]);

	// join emits join-room
	const joinRoom = (userId: string, userName: string) => {
		if (roomId) {
			socket.emit("join-room", { roomId, userId, userName });
		}
	};

	// methods to control playback
	const playPause = (playing: boolean) => {
		if (roomId) socket.emit("play-pause", { roomId, playing });
		setIsPlaying(playing);
	};
	const seekPlayback = (time: number) => {
		if (roomId) socket.emit("seek", { roomId, time });
		setCurrentTime(time);
	};

	return (
		<RoomContext.Provider
			value={{
				room,
				participants,
				loading,
				error,
				isPlaying,
				currentTime,
				playPause,
				seekPlayback,
				joinRoom,
			}}
		>
			{children}
		</RoomContext.Provider>
	);
};

export function useRoom() {
	const ctx = useContext(RoomContext);
	if (!ctx) throw new Error("useRoom must be inside RoomProvider");
	return ctx;
}
