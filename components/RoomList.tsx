import React from "react";
import { FlatList, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

export interface RoomItem {
	id: string;
	name: string;
	lastActive: string;
}

export interface RoomListProps {
	rooms: RoomItem[];
	onRoomPress: (roomId: string) => void;
	style?: ViewStyle;
	itemStyle?: ViewStyle;
	titleStyle?: TextStyle;
	metaStyle?: TextStyle;
}

// RoomList component: renders a list of rooms with touchable items Purely presentational; navigation logic should live in the parent
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
						Last active: {new Date(item.lastActive).toLocaleTimeString()}
					</Text>
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
