import { useUser } from "@/contexts/UserContext";
import { Colors, Fonts, GlobalStyles } from "@/styles/theme";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
	const { user, loading, error, updateProfile } = useUser();
	const [name, setName] = useState("");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const router = useRouter();

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
			router.replace("/");
		} catch (err) {
			console.error(err);
			Alert.alert("Error", "Couldn't save profile.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <ActivityIndicator style={GlobalStyles.center} size="large" />;
	}
	if (error) {
		return (
			<View style={GlobalStyles.center}>
				<Text style={GlobalStyles.text}>Error loading profile</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
			<View style={styles.container}>
				<Text style={styles.title}>Your Vibe</Text>

				{/* Avatar Section */}
				<View style={styles.avatarBlock}>
					{avatarUrl ? (
						<Image source={{ uri: avatarUrl }} style={styles.avatar} />
					) : (
						<View style={[styles.avatar, styles.avatarPlaceholder]}>
							<Text style={{ fontFamily: Fonts.body, fontSize: 24 }}>👤</Text>
						</View>
					)}
					<TouchableOpacity onPress={pickAvatar} style={styles.chooseButton}>
						<Text style={styles.chooseButtonText}>Choose Photo</Text>
					</TouchableOpacity>
				</View>

				{/* Change Name */}
				<Text style={styles.label}>Display Name</Text>
				<TextInput
					style={styles.input}
					value={name}
					onChangeText={setName}
					placeholder="Your name"
					placeholderTextColor={Colors.textSecondary}
				/>

				{/* Save button */}
				<TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
					<Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Profile"}</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 8,
		justifyContent: "center",
	},
	title: {
		fontFamily: Fonts.title,
		fontSize: 32,
		textAlign: "center",
		color: Colors.textPrimary,
		marginBottom: 24,
	},
	label: {
		fontFamily: Fonts.body,
		fontSize: 16,
		color: Colors.textPrimary,
	},
	input: {
		borderWidth: 1,
		borderColor: Colors.border,
		padding: 10,
		borderRadius: 8,
		fontFamily: Fonts.body,
		color: Colors.textPrimary,
		backgroundColor: Colors.cardBackground,
		marginBottom: 32,
	},
	avatarBlock: {
		alignItems: "center",
		marginBottom: 32,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: Colors.cardBackground,
		marginBottom: 12,
	},
	avatarPlaceholder: {
		justifyContent: "center",
		alignItems: "center",
	},
	chooseButton: {
		backgroundColor: Colors.border,
		paddingVertical: 6,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	chooseButtonText: {
		fontFamily: Fonts.body,
		color: Colors.textPrimary,
		fontSize: 14,
	},
	saveButton: {
		backgroundColor: Colors.primary,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
	},
	saveButtonText: {
		fontFamily: Fonts.subtitle,
		color: "#fff",
		fontSize: 16,
	},
});
