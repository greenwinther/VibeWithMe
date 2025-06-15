import { useChat } from "@/contexts/ChatContext";
import { useRoom } from "@/contexts/RoomContext";
import { useUser } from "@/contexts/UserContext";
import React, { useState } from "react";
import { Button, FlatList, Image, StyleSheet, Text, TextInput, View } from "react-native";

export const Chat: React.FC = () => {
	const { room } = useRoom();
	const { user } = useUser();
	const { messages, sendMessage } = useChat();
	const [text, setText] = useState("");

	if (!room || !user) {
		return (
			<View style={styles.center}>
				<Text>Loading chat...</Text>
			</View>
		);
	}

	const handleSend = () => {
		if (!text.trim()) return;
		sendMessage(text);
		setText("");
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.message}>
						<Text style={styles.sender}>{item.sender.name}</Text>
						{item.sender.avatarUrl && (
							<Image source={{ uri: item.sender.avatarUrl }} style={styles.avatar} />
						)}
						<Text style={styles.text}>{item.text}</Text>
					</View>
				)}
			/>
			<View style={styles.inputRow}>
				<TextInput
					style={styles.input}
					placeholder="Type a message…"
					value={text}
					onChangeText={setText}
				/>
				<Button title="Send" onPress={handleSend} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 8 },
	message: {
		marginVertical: 4,
		padding: 6,
		backgroundColor: "#f1f1f1",
		borderRadius: 4,
		flexDirection: "row",
		alignItems: "center",
	},
	sender: { fontWeight: "bold", marginRight: 6 },
	avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
	text: { flexShrink: 1 },
	inputRow: { flexDirection: "row", alignItems: "center" },
	input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8, marginRight: 8 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
