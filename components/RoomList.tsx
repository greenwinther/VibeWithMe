import { PublicRoomDTO } from "@/server/types";
import React from "react";
import { FlatList, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

export interface RoomListProps {
	/** Array of public rooms to display */
	rooms: PublicRoomDTO[];
	/** Callback when a room is pressed */
	onRoomPress: (roomId: string) => void;
	style?: ViewStyle;
	itemStyle?: ViewStyle;
	titleStyle?: TextStyle;
	metaStyle?: TextStyle;
}

/**
 * RoomList component: renders a list of rooms with touchable items.
 * Uses PublicRoomDTO (includes participantCount).
 */
export default function RoomList({
	rooms,
	onRoomPress,
	style,
	itemStyle,
	titleStyle,
	metaStyle,
}: RoomListProps) {
	return (
		<FlatList
			contentContainerStyle={[styles.container, style]}
			data={rooms}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => (
				<TouchableOpacity style={[styles.item, itemStyle]} onPress={() => onRoomPress(item.id)}>
					<Text style={[styles.title, titleStyle]} numberOfLines={1}>
						{item.name}
					</Text>
					<Text style={[styles.meta, metaStyle]}>
						Last active: {new Date(item.lastActive).toLocaleString()}
					</Text>
					<Text style={[styles.meta, metaStyle]}>Participants: {item.participantCount}</Text>
				</TouchableOpacity>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingBottom: 16,
	},
	item: {
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 18,
		fontWeight: "500",
	},
	meta: {
		marginTop: 4,
		fontSize: 14,
		color: "#555",
	},
});
