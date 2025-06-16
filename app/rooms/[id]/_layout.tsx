import { ChatProvider } from "@/contexts/ChatContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { RoomProvider } from "@/contexts/RoomContext";
import { Slot } from "expo-router";
import React from "react";

export default function RoomLayout() {
	return (
		<RoomProvider>
			<PlaylistProvider>
				<ChatProvider>
					<Slot />
				</ChatProvider>
			</PlaylistProvider>
		</RoomProvider>
	);
}
