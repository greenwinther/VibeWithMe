import { ChatProvider } from "@/contexts/ChatContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { Slot, useLocalSearchParams } from "expo-router";
import React from "react";

export default function RoomLayout() {
	const { id: roomId } = useLocalSearchParams<{ id: string }>();

	return (
		<PlaylistProvider roomId={roomId}>
			<ChatProvider roomId={roomId}>
				<Slot />
			</ChatProvider>
		</PlaylistProvider>
	);
}
