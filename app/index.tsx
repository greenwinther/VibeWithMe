import Button from "@/components/Button";
import InputField from "@/components/InputField";
import RoomList from "@/components/RoomList";
import { useUser } from "@/contexts/UserContext";
import { PublicRoomDTO } from "@/server/types";

import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LobbyScreen() {
	const router = useRouter();
	const { user, loading: userLoading, error: userError } = useUser();
	const [rooms, setRooms] = useState<PublicRoomDTO[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterText, setFilterText] = useState("");

	// Fetch rooms on mount
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("http://localhost:4000/rooms");
				const data: PublicRoomDTO[] = await res.json();
				setRooms(data);
			} catch (e) {
				console.error("Load rooms failed", e);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const handleCreateRoom = async () => {
		if (!filterText.trim() || !user) return;
		try {
			const res = await fetch("http://localhost:4000/rooms", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: filterText, isPublic: true }),
			});
			const room = await res.json();
			router.push(`/rooms/${room.id}`);
		} catch (e) {
			console.error("Create room failed", e);
		}
	};

	const handleJoin = (id: string) => router.push(`/rooms/${id}`);
	const handleGoToProfile = () => router.push("/profile");

	// filter rooms by name
	const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(filterText.toLowerCase()));

	if (userLoading || loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator />
			</View>
		);
	}
	if (userError) {
		return (
			<View style={styles.center}>
				<Text>Error loading user</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Profile */}
			<Button title="Profile" onPress={handleGoToProfile} />

			{/* Filter / Create input */}
			<InputField
				style={styles.input}
				placeholder="Filter rooms or enter name"
				value={filterText}
				onChangeText={setFilterText}
			/>
			<Button title={`Create "${filterText}"`} onPress={handleCreateRoom} />

			{/* Room list */}
			<RoomList rooms={filteredRooms} onRoomPress={handleJoin} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: "#fff" },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	input: { marginVertical: 12 },
});
