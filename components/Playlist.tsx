import { usePlaylist } from "@/contexts/PlaylistContext";
import { PlaylistItemDTO } from "@/server/types";
import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PlaylistProps {
	onSelect: (item: PlaylistItemDTO) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({ onSelect }) => {
	const { queue } = usePlaylist();

	return (
		<View style={styles.container}>
			<FlatList
				data={queue}
				keyExtractor={(item) => `${item.position}-${item.video.videoId}`}
				renderItem={({ item }) => (
					<TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
						<Image source={{ uri: item.video.thumbnail }} style={styles.thumbnail} />
						<View style={styles.info}>
							<Text style={styles.title} numberOfLines={1}>
								{item.video.title}
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
