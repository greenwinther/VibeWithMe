import { RoomProvider } from "@/contexts/RoomContext";
import { UserProvider } from "@/contexts/UserContext";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<UserProvider>
				<RoomProvider>
					<Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
						{/* Lobby */}
						<Stack.Screen name="index" />
						{/* Dynamic Room pages */}
						<Stack.Screen name="rooms/[id]" options={{ headerShown: true }} />
						<Stack.Screen name="profile" options={{ title: "Profile", headerShown: true }} />
					</Stack>
				</RoomProvider>
			</UserProvider>
		</SafeAreaProvider>
	);
}
