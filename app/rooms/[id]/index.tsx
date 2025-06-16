import { Chat } from "@/components/Chat";
import { PlaylistQueue } from "@/components/PlaylistQueue";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useRoom } from "@/contexts/RoomContext";
import { useUser } from "@/contexts/UserContext";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function RoomScreen() {
	const { room, loading, error, joinRoom } = useRoom();
	const { user } = useUser();
	const { addVideo } = usePlaylist();

	useEffect(() => {
		if (room && user) {
			joinRoom(user.id, user.name);
		}
	}, [room?.id, user?.id]);

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (error || !room) {
		return (
			<View style={styles.center}>
				<Text>Error loading room</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{room.name}</Text>

			{/* Video playback synced via context */}
			<YouTubePlayer height={250} />

			{/* Search and add videos */}
			<YouTubeSearch onSelect={(video) => addVideo(video)} />

			{/* Playlist display */}
			<PlaylistQueue onSelect={() => {}} />

			{/* Chat UI */}
			<Chat />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	title: { fontSize: 24, fontWeight: "600", marginBottom: 12 },
});
