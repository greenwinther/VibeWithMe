/**
 * ChatContext manages real-time chat messages for a room.
 */

import { socket } from "@/server/src/lib/socket";
import { ChatMessageDTO } from "@/server/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ChatState {
	messages: ChatMessageDTO[];
	sendMessage: (text: string) => void;
}

interface ChatProviderProps {
	roomId: string;
	children: React.ReactNode;
}

const ChatContext = createContext<ChatState | undefined>(undefined);

export const ChatProvider: React.FC<ChatProviderProps> = ({ roomId, children }) => {
	const [messages, setMessages] = useState<ChatMessageDTO[]>([]);

	useEffect(() => {
		// Handler for incoming real-time chat messages
		const handleMessage = (msg: ChatMessageDTO) => {
			setMessages((prev) => [...prev, msg]);
		};

		socket.on("chat:message", handleMessage);

		// Fetch chat history
		socket.emit("chat:fetch", { roomId });
		socket.on("chat:history", (history: ChatMessageDTO[]) => {
			setMessages(history);
		});

		return () => {
			socket.off("chat:message", handleMessage);
			socket.off("chat:history");
		};
	}, [roomId]);

	const sendMessage = (text: string) => {
		socket.emit("chat:message", { roomId, text });
	};

	return <ChatContext.Provider value={{ messages, sendMessage }}>{children}</ChatContext.Provider>;
};

/** Hook to consume ChatContext */
export function useChat() {
	const ctx = useContext(ChatContext);
	if (!ctx) {
		throw new Error("useChat must be used within a ChatProvider");
	}
	return ctx;
}
