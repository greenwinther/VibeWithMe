import Constants from "expo-constants";

declare const __DEV__: boolean;

const debuggerHost = Constants.manifest2?.debuggerHost;
let host = debuggerHost?.split(":")[0] ?? "localhost";

// Temporary override to test emulator vs phone issues
const devOverrideIP = "192.168.8.37";
if (__DEV__) {
	host = devOverrideIP;
}

export const API_BASE = `http://${host}:4000`;
