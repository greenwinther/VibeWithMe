import { Chat } from "@/components/Chat";
import { Playlist } from "@/components/Playlist";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useRoom } from "@/contexts/RoomContext";
import { useUser } from "@/contexts/UserContext";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function RoomScreen() {
	const { room, loading, error, joinRoom, playPause, isPlaying } = useRoom();
	const { user } = useUser();
	const { queue, addVideo } = usePlaylist();

	// Join on mount
	useEffect(() => {
		if (room && user) {
			joinRoom(user.id, user.name);
		}
	}, [room?.id, user?.id]);

	// Auto-play the first video as soon as queue populates
	useEffect(() => {
		console.log("⏱️ queue length:", queue.length);
		console.log("▶️ isPlaying:", isPlaying);
		if (queue.length > 0 && !isPlaying) {
			playPause(true);
		}
	}, [queue, isPlaying]);

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
			<Playlist onSelect={() => {}} />

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
