// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
				{/* The “index” route is your Lobby */}
				<Stack.Screen name="index" />
				{/* This tells expo-router about the dynamic rooms/[id] page */}
				<Stack.Screen name="rooms/[id]" />
			</Stack>
		</SafeAreaProvider>
	);
}
