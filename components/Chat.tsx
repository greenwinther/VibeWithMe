import { useChat } from "@/contexts/ChatContext";
import { useRoom } from "@/contexts/RoomContext";
import { useUser } from "@/contexts/UserContext";
import { Colors, Fonts } from "@/styles/theme";
import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

export const Chat: React.FC = () => {
	const { room } = useRoom();
	const { user } = useUser();
	const { messages } = useChat();

	if (!room || !user) {
		return (
			<View style={styles.center}>
				<Text style={styles.text}>Loading chat...</Text>
			</View>
		);
	}

	console.log("Chat room:", room);
	console.log("Chat user:", user);

	return (
		<FlatList
			data={messages}
			extraData={messages}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => (
				<View style={styles.message}>
					{item.sender.avatarUrl && (
						<Image source={{ uri: item.sender.avatarUrl }} style={styles.avatar} />
					)}
					<View style={styles.messageContent}>
						<Text style={styles.sender}>{item.sender.name}</Text>
						<Text style={styles.body}>{item.text}</Text>
					</View>
				</View>
			)}
			showsVerticalScrollIndicator={false}
			inverted
		/>
	);
};

const styles = StyleSheet.create({
	message: {
		flexDirection: "row",
		alignItems: "flex-start",
		backgroundColor: Colors.cardBackground,
		padding: 10,
		borderRadius: 12,
		marginVertical: 6,
		borderColor: Colors.border,
		borderWidth: 1,
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 10,
		marginTop: 2,
	},
	messageContent: {
		flexShrink: 1,
	},
	sender: {
		fontFamily: Fonts.subtitle,
		fontSize: 14,
		color: Colors.textPrimary,
		marginBottom: 2,
	},
	body: {
		fontFamily: Fonts.body,
		fontSize: 14,
		color: Colors.textSecondary,
	},
	text: {
		fontFamily: Fonts.body,
		color: Colors.textPrimary,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.background,
	},
});
