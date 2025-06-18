// components/MiniDrawer.tsx
import { Colors, Fonts } from "@/styles/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Animated, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";

const screenHeight = Dimensions.get("window").height;

interface MiniDrawerProps {
	open: boolean;
	onClose: () => void;
	heightRatio?: number;
}

export default function MiniDrawer({ open, onClose, heightRatio = 0.25 }: MiniDrawerProps) {
	const router = useRouter();
	const drawerHeight = screenHeight * heightRatio;

	const translateY = React.useRef(new Animated.Value(drawerHeight)).current;

	React.useEffect(() => {
		Animated.timing(translateY, {
			toValue: open ? 0 : drawerHeight,
			duration: 250,
			useNativeDriver: true,
		}).start();
	}, [open]);

	const menuItems = [
		{ key: "back", label: "🔙 Back to Lobby", action: () => router.push("/") },
		{ key: "username", label: "✏️ Change Username", action: () => router.push("/profile") },
		{ key: "settings", label: "🛠️ Server Settings", action: () => alert("Server settings coming soon!") },
	];

	return (
		<Animated.View style={[styles.drawer, { height: drawerHeight, transform: [{ translateY }] }]}>
			<FlatList
				data={menuItems}
				keyExtractor={(item) => item.key}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={item.action} style={styles.item}>
						<Text style={styles.itemText}>{item.label}</Text>
					</TouchableOpacity>
				)}
			/>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	drawer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: Colors.cardBackground,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		padding: 16,
		elevation: 10,
	},
	item: {
		paddingVertical: 12,
	},
	itemText: {
		fontSize: 16,
		color: Colors.textPrimary,
		fontFamily: Fonts.body,
	},
});
