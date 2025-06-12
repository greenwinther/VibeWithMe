import React from "react";
import { GestureResponderEvent, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Profile component: round avatar, pressable

export interface ProfileProps {
	avatarUrl?: string;
	initials?: string;
	onPress: (event: GestureResponderEvent) => void;
	size?: number;
}

export default function Profile({ avatarUrl, initials, onPress, size = 40 }: ProfileProps) {
	const radius = size / 2;

	return (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.container, { width: size, height: size, borderRadius: radius }]}
		>
			{avatarUrl ? (
				<Image
					source={{ uri: avatarUrl }}
					style={[styles.image, { width: size, height: size, borderRadius: radius }]}
				/>
			) : (
				<View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
					{initials ? (
						<Text style={styles.initials}>{initials}</Text>
					) : (
						<Text style={styles.initials}>?</Text>
					)}
				</View>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		overflow: "hidden",
	},
	image: {
		resizeMode: "cover",
	},
	fallback: {
		backgroundColor: "#ccc",
		justifyContent: "center",
		alignItems: "center",
	},
	initials: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
