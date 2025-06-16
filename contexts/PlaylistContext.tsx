import { useRoom } from "@/contexts/RoomContext";
import { socket } from "@/server/src/lib/socket";
import { PlaylistItemDTO, VideoDTO } from "@/server/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

interface PlaylistState {
	queue: PlaylistItemDTO[];
	currentIndex: number;
	addVideo: (video: VideoDTO) => void;
	nextVideo: () => void;
}

const PlaylistContext = createContext<PlaylistState | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { room } = useRoom();
	const { user } = useUser();
	const [queue, setQueue] = useState<PlaylistItemDTO[]>([]);

	// subscribe to updates
	useEffect(() => {
		socket.on("playlist:update", setQueue);
		if (room?.id) socket.emit("playlist:fetch", { roomId: room.id });
		return () => {
			socket.off("playlist:update");
		};
	}, [room?.id]);

	// updated addVideo
	const addVideo = (video: VideoDTO) => {
		if (!room?.id || !user?.id) return;
		socket.emit("video:add", {
			roomId: room.id,
			userId: user.id,
			video,
		});
	};

	const currentIndex = room?.currentVideoPosition ?? 0;

	const nextVideo = () => {
		const nextIdx = currentIndex + 1;
		console.log("✂️ advancing to next video");
		if (room?.id && nextIdx < queue.length) {
			socket.emit("video:advance", { roomId: room.id, newIndex: nextIdx });
		}
	};

	return (
		<PlaylistContext.Provider value={{ queue, currentIndex, addVideo, nextVideo }}>
			{children}
		</PlaylistContext.Provider>
	);
};

export function usePlaylist() {
	const ctx = useContext(PlaylistContext);
	if (!ctx) throw new Error("usePlaylist must be inside PlaylistProvider");
	return ctx;
}
