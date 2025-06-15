import { ChatProvider } from "@/contexts/ChatContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { Slot } from "expo-router";
import React from "react";

export default function RoomLayout() {
	return (
		<PlaylistProvider>
			<ChatProvider>
				<Slot />
			</ChatProvider>
		</PlaylistProvider>
	);
}
