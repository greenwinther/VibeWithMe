import { usePlaylist } from "@/contexts/PlaylistContext";
import { PlaylistItemDTO } from "@/server/types";
import { Colors, Fonts } from "@/styles/theme";
import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity } from "react-native";

interface PlaylistProps {
	onSelect: (item: PlaylistItemDTO) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({ onSelect }) => {
	const { queue } = usePlaylist();

	return (
		<FlatList
			data={queue}
			horizontal
			showsHorizontalScrollIndicator={false}
			keyExtractor={(item) => `${item.position}-${item.video.videoId}`}
			contentContainerStyle={styles.listContent}
			renderItem={({ item }) => (
				<TouchableOpacity style={styles.item} onPress={() => onSelect(item)} activeOpacity={0.8}>
					<Image source={{ uri: item.video.thumbnail }} style={styles.thumbnail} />
					<Text style={styles.title} numberOfLines={1}>
						{item.video.title}
					</Text>
					<Text style={styles.meta} numberOfLines={1}>
						#{item.position} by {item.addedBy.name}
					</Text>
				</TouchableOpacity>
			)}
		/>
	);
};

const styles = StyleSheet.create({
	listContent: {
		paddingHorizontal: 12,
	},
	item: {
		width: 120,
		marginRight: 12,
		backgroundColor: Colors.cardBackground,
		borderRadius: 10,
		padding: 8,
		alignItems: "center",
	},
	thumbnail: {
		width: "100%",
		height: 70,
		borderRadius: 6,
		marginBottom: 6,
	},
	title: {
		fontFamily: Fonts.body,
		fontSize: 13,
		color: Colors.textPrimary,
		textAlign: "center",
	},
	meta: {
		fontFamily: Fonts.body,
		fontSize: 11,
		color: Colors.textSecondary,
		marginTop: 2,
		textAlign: "center",
	},
});
