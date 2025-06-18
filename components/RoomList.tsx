import { PublicRoomDTO } from "@/server/types";
import { Colors, Fonts } from "@/styles/theme";
import React from "react";
import { FlatList, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

export interface RoomListProps {
	rooms: PublicRoomDTO[];
	onRoomPress: (roomId: string) => void;
	style?: ViewStyle;
	itemStyle?: ViewStyle;
	titleStyle?: TextStyle;
	metaStyle?: TextStyle;
}

// RoomList component: renders a list of rooms with touchable items.
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
			contentContainerStyle={{ paddingBottom: 100 }}
			style={[{ flex: 1 }, style]}
			data={rooms}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => (
				<TouchableOpacity
					style={[styles.item, itemStyle]}
					onPress={() => onRoomPress(item.id)}
					activeOpacity={0.7}
				>
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
	item: {
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: Colors.border,
		borderRadius: 12,
		backgroundColor: Colors.cardBackground,
	},
	title: {
		fontFamily: Fonts.subtitle,
		fontSize: 18,
		color: Colors.textPrimary,
	},
	meta: {
		marginTop: 4,
		fontFamily: Fonts.body,
		fontSize: 14,
		color: Colors.textSecondary,
	},
});
