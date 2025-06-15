import { socket } from "@/server/src/lib/socket";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type QueueItem = {
	id: string;
	videoId: string;
	title: string;
	thumbnail: string;
	position: number;
	addedBy: { id: string; name: string };
};

export const PlaylistQueue: React.FC<{
	roomId: string;
	onSelect: (item: QueueItem) => void;
}> = ({ roomId, onSelect }) => {
	const [queue, setQueue] = useState<QueueItem[]>([]);

	useEffect(() => {
		// Listen for updates
		socket.on("playlist:update", (newQueue: QueueItem[]) => {
			setQueue(newQueue);
		});

		// Optionally, request initial queue
		socket.emit("playlist:fetch", { roomId });

		return () => {
			socket.off("playlist:update");
		};
	}, [roomId]);

	return (
		<View style={styles.container}>
			<FlatList
				data={queue}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
						<Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
						<View style={styles.info}>
							<Text style={styles.title} numberOfLines={1}>
								{item.title}
							</Text>
							<Text style={styles.meta}>
								#{item.position} added by {item.addedBy.name}
							</Text>
						</View>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 8 },
	item: {
		flexDirection: "row",
		marginVertical: 4,
		alignItems: "center",
	},
	thumbnail: { width: 80, height: 45, borderRadius: 4, marginRight: 12 },
	info: { flex: 1 },
	title: { fontWeight: "600" },
	meta: { fontSize: 12, color: "#666" },
});
