import { socket } from "@/server/src/lib/socket";
import { PlaylistItemDTO } from "@/server/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface PlaylistState {
	queue: PlaylistItemDTO[];
	addVideo: (video: PlaylistItemDTO) => void;
}

interface PlaylistProviderProps {
	roomId: string;
	children: React.ReactNode;
}

const PlaylistContext = createContext<PlaylistState | undefined>(undefined);

export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({ roomId, children }) => {
	const [queue, setQueue] = useState<PlaylistItemDTO[]>([]);

	useEffect(() => {
		socket.on("playlist:update", setQueue);
		// optionally fetch initial queue:
		socket.emit("playlist:fetch", { roomId });
		return () => {
			socket.off("playlist:update");
		};
	}, [roomId]);

	const addVideo = (video: PlaylistItemDTO) => {
		socket.emit("video:add", { roomId, video });
	};

	return <PlaylistContext.Provider value={{ queue, addVideo }}>{children}</PlaylistContext.Provider>;
};

export function usePlaylist() {
	const ctx = useContext(PlaylistContext);
	if (!ctx) throw new Error("usePlaylist must be inside PlaylistProvider");
	return ctx;
}
