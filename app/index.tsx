import Button from "@/components/Button";
import InputField from "@/components/InputField";
import RoomList from "@/components/RoomList";
import { useUser } from "@/contexts/UserContext";
import { API_BASE } from "@/server/src/lib/api";
import { PublicRoomDTO } from "@/server/types";
import { Colors, GlobalStyles } from "@/styles/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LobbyScreen() {
	const router = useRouter();
	const { user, loading: userLoading, error: userError } = useUser();
	const [rooms, setRooms] = useState<PublicRoomDTO[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterText, setFilterText] = useState("");

	// Fetch rooms on mount
	useEffect(() => {
		(async () => {
			const url = `${API_BASE}/rooms`;
			console.log("🔗  loading rooms from:", url);
			try {
				const res = await fetch(url);
				if (!res.ok) throw new Error(`Status ${res.status}`);
				const data: PublicRoomDTO[] = await res.json();
				setRooms(data);
			} catch (e) {
				console.error("❌ Load rooms failed", e);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const handleCreateRoom = async () => {
		if (!filterText.trim() || !user) return;
		try {
			const res = await fetch(`${API_BASE}/rooms`, {
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

	// Filter rooms by name
	const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(filterText.toLowerCase()));
	console.log("🧠 userLoading:", userLoading);
	console.log("🧠 room loading:", loading);
	console.log("🧠 user:", user);

	if (userLoading || loading) {
		return (
			<View style={GlobalStyles.center}>
				<ActivityIndicator />
			</View>
		);
	}
	if (userError) {
		return (
			<View style={GlobalStyles.center}>
				<Text style={GlobalStyles.text}>Error loading user</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
			{/* Avatar */}
			<View style={styles.avatarContainer}>
				<TouchableOpacity onPress={handleGoToProfile} style={styles.profileButton}>
					{user?.avatarUrl ? (
						<Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
					) : (
						<Text style={styles.avatarFallbackText}>👤</Text>
					)}
				</TouchableOpacity>
			</View>

			{/* Full screen wrapper */}
			<View style={{ flex: 1 }}>
				{/* Logo */}
				<View style={styles.logoWrapper}>
					<Image
						source={require("../assets/images/logo.png")}
						style={styles.logo}
						resizeMode="contain"
					/>
				</View>

				{/* Scrollable area */}
				<View style={styles.contentWrapper}>
					<InputField
						placeholder="Filter rooms or enter name"
						value={filterText}
						onChangeText={setFilterText}
						style={{ marginBottom: 12 }}
					/>
					<Button
						title={`Create "${filterText}"`}
						onPress={handleCreateRoom}
						style={{ marginBottom: 20 }}
					/>
				</View>

				<RoomList rooms={filteredRooms} onRoomPress={handleJoin} style={styles.scrollWrapper} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	contentWrapper: {
		paddingHorizontal: 16,
	},
	scrollWrapper: {
		paddingHorizontal: 16,
		flex: 1,
	},
	logoWrapper: {
		alignItems: "center",
		marginTop: 24,
		marginBottom: 24,
	},
	logo: {
		width: 200,
		height: 200,
	},
	avatarContainer: {
		paddingHorizontal: 24,
		paddingTop: 24,
		alignItems: "flex-end",
	},
	profileButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	avatarImage: {
		width: "100%",
		height: "100%",
		borderRadius: 22,
	},
	avatarFallbackText: {
		color: "#fff",
		fontSize: 20,
	},
});
