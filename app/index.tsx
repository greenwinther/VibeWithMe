/**
 * app/index.tsx
 *
 * Lobby Screen with modular components:
 * - Profile button to open username modal
 * - TextInput for filter and room name
 * - Button to create a new room
 * - RoomList to display and join rooms
 */

import Button from "@/components/Button";
import InputField from "@/components/InputField";
import Profile from "@/components/Profile";
import RoomList, { RoomItem } from "@/components/RoomList";
import { PublicRoomDTO } from "@/server/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function LobbyScreen() {
	const router = useRouter();
	const [rooms, setRooms] = useState<PublicRoomDTO[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterText, setFilterText] = useState("");
	const [username, setUsername] = useState("");
	const [modalVisible, setModalVisible] = useState(false);

	// Fetch rooms and username on mount
	useEffect(() => {
		fetchRooms();
		loadUsername();
	}, []);

	const fetchRooms = async () => {
		try {
			const res = await fetch("http://localhost:4000/rooms");
			const data: PublicRoomDTO[] = await res.json();
			setRooms(data);
		} catch (e) {
			console.error("Load rooms failed", e);
		} finally {
			setLoading(false);
		}
	};

	const loadUsername = async () => {
		const saved = await AsyncStorage.getItem("username");
		if (saved) setUsername(saved);
		else {
			const rand = `User${Math.floor(Math.random() * 1000)}`;
			setUsername(rand);
			await AsyncStorage.setItem("username", rand);
		}
	};

	const handleProfilePress = () => setModalVisible(true);
	const handleCreateRoom = async () => {
		if (!filterText.trim()) return;
		try {
			const res = await fetch("http://localhost:4000/rooms", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: filterText, isPublic: true }),
			});
			const room: PublicRoomDTO = await res.json();
			/* router.push(`/rooms/${room.id}`); */
		} catch (e) {
			console.error("Create room failed", e);
		}
	};

	const handleJoin = (id: string) => {
		/* router.push(`/rooms/${id}`) */
	};

	// Prepare filtered list
	const filtered: RoomItem[] = rooms
		.filter((r) => r.name.toLowerCase().includes(filterText.toLowerCase()))
		.map((r) => ({ id: r.id, name: r.name, lastActive: r.lastActive }));

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Profile */}
			<Profile initials={username.charAt(0)} onPress={handleProfilePress} />

			{/* Filter / Create input */}
			<InputField
				style={styles.input}
				placeholder="Filter rooms or enter name"
				value={filterText}
				onChangeText={setFilterText}
			/>
			<Button title={`Create "${filterText}"`} onPress={handleCreateRoom} />

			{/* Room list */}
			<RoomList rooms={filtered} onRoomPress={handleJoin} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: "#fff" },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	input: { marginVertical: 12 },
});
