import { Chat } from "@/components/Chat";
import InputField from "@/components/InputField";
import { PlaylistQueue, QueueItem } from "@/components/PlaylistQueue";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { socket } from "@/server/src/lib/socket";
import { VideoDTO } from "@/server/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

type Params = {
	id: string;
};

export default function RoomScreen() {
	// Pull the `id` param from the URL
	const { id: roomId } = useLocalSearchParams<Params>();
	const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
	const [roomName, setRoomName] = useState<string>("");

	const [queue, setQueue] = useState<VideoDTO[]>([]);

	const [userId] = useState(() => {
		const id = uuidv4();
		AsyncStorage.setItem("userId", id);
		return id;
	});
	const [userName] = useState(() => {
		const name = "Guest";
		AsyncStorage.setItem("userName", name);
		return name;
	});

	const handleSelectVideo = (video: VideoDTO) => {
		// 1) send to server to add to playlist
		socket.emit("video:add", { roomId, userId, video });
		// 2) locally update queue so UI is snappy
		setQueue((q) => [...q, video]);
	};

	const handlePlayPause = (isPlaying: boolean) => {
		console.log("Video is now", isPlaying ? "playing" : "paused");
		// TODO: emit socket event to sync other clients
	};

	const handleSelectQueueItem = (item: QueueItem) => {
		// e.g. jump player to this video
	};

	// fetch room metadata (e.g. its name)
	useEffect(() => {
		if (!roomId) return;
		fetch(`http://localhost:4000/rooms/${roomId}`)
			.then((res) => res.json())
			.then((room) => setRoomName(room.name))
			.catch(console.error);
	}, [roomId]);

	useEffect(() => {
		if (!roomId) return;
		socket.emit("join-room", { roomId, userId, userName });
	}, [roomId, userId, userName]);

	if (!roomId) {
		return (
			<View style={styles.center}>
				<Text>Missing roomId</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={{ fontSize: 24, padding: 12 }}>{roomName}</Text>
			<YouTubePlayer videoId={videoId} height={250} onPlayPause={handlePlayPause} />
			<YouTubeSearch onSelect={handleSelectVideo} />
			<PlaylistQueue roomId={roomId} onSelect={handleSelectQueueItem} />
			<InputField
				placeholder="Enter YouTube ID"
				value={videoId}
				onChangeText={setVideoId}
				style={{
					borderWidth: 1,
					borderColor: "#ccc",
					padding: 8,
					marginVertical: 12,
				}}
			/>

			<Chat roomId={roomId!} userId={userId} userName={userName} />
			<ActivityIndicator />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
});
