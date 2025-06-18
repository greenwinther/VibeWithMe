import Button from "@/components/Button";
import { Chat } from "@/components/Chat";
import InputField from "@/components/InputField";
import MiniDrawer from "@/components/MiniDrawer";
import { Playlist } from "@/components/Playlist";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { useChat } from "@/contexts/ChatContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useRoom } from "@/contexts/RoomContext";
import { useUser } from "@/contexts/UserContext";
import { Colors, GlobalStyles } from "@/styles/theme";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoomScreen() {
	const { room, loading, error, joinRoom, playPause, isPlaying } = useRoom();
	const { user } = useUser();
	const { queue, addVideo } = usePlaylist();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const { sendMessage } = useChat();
	const [text, setText] = useState("");

	// Join on mount
	useEffect(() => {
		if (room && user) {
			joinRoom(user.id, user.name);
		}
	}, [room?.id, user?.id]);

	// Auto-play the first video as soon as queue populates, why u no work
	useEffect(() => {
		console.log("⏱️ queue length:", queue.length);
		console.log("▶️ isPlaying:", isPlaying);
		if (queue.length > 0 && !isPlaying) {
			playPause(true);
		}
	}, [queue, isPlaying]);

	const handleSend = () => {
		if (!text.trim()) return;
		console.log("📨 Sending message:", text);
		sendMessage(text);
		setText("");
	};

	if (loading) {
		return (
			<View style={GlobalStyles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (error || !room) {
		return (
			<View style={GlobalStyles.center}>
				<Text style={GlobalStyles.text}>Error loading room</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header Row */}
			<View style={styles.header}>
				<Text style={[GlobalStyles.title, { marginBottom: 12 }]}>{room.name}</Text>
				<TouchableOpacity onPress={() => setDrawerOpen(!drawerOpen)} style={styles.menuButton}>
					<Text style={styles.menuText}>{drawerOpen ? "✖️" : "☰"}</Text>
				</TouchableOpacity>
			</View>

			{/* Main content */}
			<View style={{ flex: 1 }}>
				{/* Video playback synced via context */}
				<YouTubePlayer height={250} />

				{/* Playlist display */}
				<View style={{ paddingVertical: 8 }}>
					<Playlist onSelect={() => {}} />
				</View>

				<View style={styles.overlayContainer}>
					{/* Search and add videos */}
					<View style={styles.searchWrapper}>
						<YouTubeSearch onSelect={(video) => addVideo(video)} />
					</View>
					{/* Chat UI */}
					<View style={styles.chatWrapper}>
						<Chat />
						<View style={styles.inputRow}>
							<InputField
								value={text}
								onChangeText={setText}
								placeholder="Type a message…"
								style={{ flex: 1, marginRight: 8 }}
							/>
							<Button title="Send" onPress={handleSend} />
						</View>
					</View>
				</View>
			</View>
			{/* Mini drawer */}
			<MiniDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 8,
	},
	menuButton: {
		backgroundColor: Colors.primary,
		padding: 10,
		borderRadius: 20,
	},
	menuText: {
		color: "#fff",
		fontSize: 20,
	},
	overlayContainer: {
		flex: 1,
		justifyContent: "space-between",
	},
	searchWrapper: {
		maxHeight: 400,
	},
	chatWrapper: {
		flex: 1,
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: 8,
	},
});
