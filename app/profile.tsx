import { useUser } from "@/contexts/UserContext";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, TextInput, View } from "react-native";

export default function ProfileScreen() {
	const { user, loading, error, updateProfile } = useUser();
	const [name, setName] = useState("");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	// Initialize form fields when user loads
	useEffect(() => {
		if (user) {
			setName(user.name);
			setAvatarUrl(user.avatarUrl ?? null);
		}
	}, [user]);

	const pickAvatar = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert("Permission denied", "Cannot access photo library.");
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: "images" as ImagePicker.MediaType,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});
		if (!result.canceled && result.assets.length > 0) {
			setAvatarUrl(result.assets[0].uri);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await updateProfile({ name, avatarUrl: avatarUrl ?? undefined });
			Alert.alert("Saved", "Your profile has been updated.");
		} catch (err) {
			console.error(err);
			Alert.alert("Error", "Couldn't save profile.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <ActivityIndicator style={styles.center} size="large" />;
	}
	if (error) {
		return (
			<View style={styles.center}>
				<Text>Error loading profile</Text>
			</View>
		);
	}

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
				{saving ? <ActivityIndicator /> : <Button title="Save Profile" onPress={handleSave} />}
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
