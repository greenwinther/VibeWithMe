import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Params = {
	id: string;
};

export default function RoomScreen() {
	// Pull the `id` param from the URL
	const { id } = useLocalSearchParams<Params>();

	if (!id) {
		return (
			<View style={styles.center}>
				<Text>Missing room ID</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome to room {id}</Text>
			<ActivityIndicator />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
});
