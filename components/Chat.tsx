import { socket } from "@/server/src/lib/socket";
import { ChatMessageDTO } from "@/server/types";
import { useEffect, useState } from "react";
import { Button, FlatList, Image, StyleSheet, Text, TextInput, View } from "react-native";

export const Chat: React.FC<{ roomId: string; userId: string; userName: string }> = ({
	roomId,
	userId,
	userName,
}) => {
	const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
	const [text, setText] = useState("");

	useEffect(() => {
		socket.emit("join-room", { roomId, userId, userName });
		socket.on("chat:message", (msg: ChatMessageDTO) => {
			setMessages((prev) => [...prev, msg]);
		});
		return () => {
			socket.off("chat:message");
		};
	}, [roomId, userId, userName]);

	const sendMessage = () => {
		if (!text.trim()) return;
		socket.emit("chat:message", { roomId, userId, text });
		setText("");
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.message}>
						{/* Render just the name */}
						<Text style={styles.sender}>{item.sender.name}</Text>
						{/* Optionally render their avatar */}
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
				<Button title="Send" onPress={sendMessage} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 8 },
	message: { marginVertical: 4, padding: 6, backgroundColor: "#f1f1f1", borderRadius: 4 },
	sender: { fontWeight: "bold", marginBottom: 2 },
	avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
	text: {},
	inputRow: { flexDirection: "row", alignItems: "center" },
	input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8, marginRight: 8 },
});
