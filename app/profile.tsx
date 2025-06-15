import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, TextInput, View } from "react-native";

const API_BASE = "http://localhost:4000";

export default function Profile() {
	const [userId, setUserId] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [avatarUrl, setAvatar] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Load the saved userId then fetch profile data
	useEffect(() => {
		(async () => {
			const id = await AsyncStorage.getItem("userId");
			if (!id) {
				Alert.alert("Error", "No userId found. Rejoin a room first.");
				setLoading(false);
				return;
			}
			setUserId(id);
			try {
				const res = await fetch(`${API_BASE}/users/${id}`);
				const user = await res.json();
				setName(user.name);
				setAvatar(user.avatarUrl ?? null);
			} catch (err) {
				console.error(err);
				Alert.alert("Error", "Couldn’t load profile.");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// Pick a new avatar
	const pickAvatar = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert("Permission denied", "Cannot access photo library.");
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: "images",
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});
		if (!result.canceled && result.assets.length > 0) {
			setAvatar(result.assets[0].uri);
		}
	};

	// Save changes back to server & AsyncStorage
	const saveProfile = async () => {
		if (!userId) return;
		setSaving(true);
		try {
			const res = await fetch(`${API_BASE}/users/${userId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, avatarUrl }),
			});
			if (!res.ok) throw new Error("Save failed");
			const user = await res.json();
			await AsyncStorage.setItem("userName", user.name);
			if (user.avatarUrl) {
				await AsyncStorage.setItem("avatarUrl", user.avatarUrl);
			}
			Alert.alert("Saved", "Your profile has been updated.");
		} catch (err) {
			console.error(err);
			Alert.alert("Error", "Couldn’t save profile.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <ActivityIndicator style={styles.center} />;

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Display Name</Text>
			<TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

			<Text style={[styles.label, { marginTop: 20 }]}>Avatar</Text>
			{avatarUrl ? (
				<Image source={{ uri: avatarUrl }} style={styles.avatar} />
			) : (
				<View style={[styles.avatar, styles.avatarPlaceholder]}>
					<Text>No avatar</Text>
				</View>
			)}
			<Button title="Choose Photo" onPress={pickAvatar} />

			<View style={{ marginTop: 30 }}>
				{saving ? <ActivityIndicator /> : <Button title="Save Profile" onPress={saveProfile} />}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	label: { fontWeight: "600", marginBottom: 8 },
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 8,
		borderRadius: 4,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 12,
	},
	avatarPlaceholder: {
		backgroundColor: "#eee",
		justifyContent: "center",
		alignItems: "center",
	},
});
