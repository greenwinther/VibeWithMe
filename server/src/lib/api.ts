import Constants from "expo-constants";
import { Platform } from "react-native";

// Expo Go on SDK 48+ populates manifest2.debuggerHost with "IP:port"
const debuggerHost = Constants.manifest2?.debuggerHost;

// Grab just the host (drop the port), or default to "localhost"
let host = debuggerHost?.split(":")[0] ?? "localhost";

// Android emulator needs 10.0.2.2 to reach your machine
if (Platform.OS === "android") {
	host = "10.0.2.2";
}

export const API_BASE = `http://${host}:4000`;
