import { useRoom } from "@/contexts/RoomContext";
import { useUser } from "@/contexts/UserContext";
import { socket } from "@/server/src/lib/socket";
import { PlaylistItemDTO, VideoDTO } from "@/server/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface PlaylistState {
	queue: PlaylistItemDTO[];
	addVideo: (video: VideoDTO) => void;
	currentIndex: number;
}

interface PlaylistProviderProps {
	children: React.ReactNode;
}

const PlaylistContext = createContext<PlaylistState | undefined>(undefined);

export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({ children }) => {
	const { room } = useRoom();
	const { user } = useUser();
	const [queue, setQueue] = useState<PlaylistItemDTO[]>([]);

	useEffect(() => {
		socket.on("playlist:update", setQueue);
		if (room?.id) {
			socket.emit("playlist:fetch", { roomId: room.id });
		}
		return () => {
			socket.off("playlist:update");
		};
	}, [room?.id]);

	const addVideo = (video: VideoDTO) => {
		if (!room?.id || !user) return;
		socket.emit("video:add", { roomId: room.id, userId: user.id, video });
	};

	const currentIndex = room?.currentVideoPosition ?? 0;

	return (
		<PlaylistContext.Provider value={{ queue, addVideo, currentIndex }}>
			{children}
		</PlaylistContext.Provider>
	);
};

export function usePlaylist() {
	const ctx = useContext(PlaylistContext);
	if (!ctx) throw new Error("usePlaylist must be inside PlaylistProvider");
	return ctx;
}
