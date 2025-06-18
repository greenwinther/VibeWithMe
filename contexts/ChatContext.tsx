import { useRoom } from "@/contexts/RoomContext";
import { useUser } from "@/contexts/UserContext";
import { socket } from "@/server/src/lib/socket";
import { ChatMessageDTO } from "@/server/types";

import React, { createContext, useContext, useEffect, useState } from "react";

//  ChatContext manages real-time chat messages for the current room.
interface ChatState {
	messages: ChatMessageDTO[];
	sendMessage: (text: string) => void;
}

const ChatContext = createContext<ChatState | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { room } = useRoom();
	const { user } = useUser();
	const [messages, setMessages] = useState<ChatMessageDTO[]>([]);

	useEffect(() => {
		if (!room?.id) return;

		// subscribe to new messages
		const handleMessage = (msg: ChatMessageDTO) => {
			console.log("📩 Received message in ChatContext", msg);
			console.log("✅ message id:", msg.id);
			setMessages((prev) => [...prev, msg]);
		};
		socket.on("chat:message", handleMessage);

		// fetch history
		socket.emit("chat:fetch", { roomId: room.id });
		socket.on("chat:history", (history: ChatMessageDTO[]) => {
			setMessages((prev) => {
				const ids = new Set(prev.map((m) => m.id));
				const merged = [...prev, ...history.filter((m) => !ids.has(m.id))];

				return merged;
			});
		});

		return () => {
			socket.off("chat:message", handleMessage);
			socket.off("chat:history");
		};
	}, [room?.id]);

	const sendMessage = (text: string) => {
		if (!room?.id || !user) return;
		console.log("📤 ChatContext sendMessage", text);
		socket.emit("chat:message", { roomId: room.id, userId: user.id, text });
	};

	return <ChatContext.Provider value={{ messages, sendMessage }}>{children}</ChatContext.Provider>;
};

export function useChat() {
	const ctx = useContext(ChatContext);
	if (!ctx) throw new Error("useChat must be used within a ChatProvider");
	return ctx;
}
