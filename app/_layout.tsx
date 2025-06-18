import { UserProvider } from "@/contexts/UserContext";
import { Colors } from "@/styles/theme";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Shrikhand: require("../assets/fonts/Shrikhand-Regular.ttf"),
		DMSerifDisplay: require("../assets/fonts/DMSerifDisplay-Regular.ttf"),
		Inter: require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
	});

	if (!fontsLoaded) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: Colors.background,
				}}
			>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<SafeAreaProvider>
			<UserProvider>
				<Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
					{/* Lobby */}
					<Stack.Screen name="index" />
					{/* Dynamic Room pages */}
					<Stack.Screen name="rooms/[id]" />
					{/* User Profile page */}
					<Stack.Screen name="profile" />
				</Stack>
			</UserProvider>
		</SafeAreaProvider>
	);
}
