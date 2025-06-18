import { API_BASE } from "@/server/src/lib/api";
import { UserDTO } from "@/server/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

interface UserState {
	user: UserDTO | null;
	loading: boolean;
	error: Error | null;
	updateProfile: (data: Partial<Pick<UserDTO, "name" | "avatarUrl">>) => Promise<void>;
}

const UserContext = createContext<UserState | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<UserDTO | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// on mount, load from AsyncStorage + fetch
	useEffect(() => {
		(async () => {
			try {
				// 1) Try to load existing
				let id = await AsyncStorage.getItem("userId");
				let name = await AsyncStorage.getItem("userName");
				let avatarUrl = await AsyncStorage.getItem("avatarUrl");

				let isNew = false;

				// 2) If missing, generate + save
				if (!id) {
					id = uuidv4();
					await AsyncStorage.setItem("userId", id);
					isNew = true;
				}
				if (!name) {
					name = `User${Math.floor(Math.random() * 1000)}`;
					await AsyncStorage.setItem("userName", name);
				}
				// If this is a new user, create it in the backend
				if (isNew) {
					const res = await fetch(`${API_BASE}/users/${id}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name, avatarUrl }),
					});
					if (!res.ok) throw new Error("Failed to create user in backend");
				}

				setUser({ id, name, avatarUrl });
			} catch (e: any) {
				console.error("❌ load user failed", e);
				setError(e);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// updateProfile API + persist to AsyncStorage
	const updateProfile = async (data: Partial<Pick<UserDTO, "name" | "avatarUrl">>) => {
		if (!user) throw new Error("Not logged in");
		try {
			const res = await fetch(`${API_BASE}/users/${user.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Save failed");
			const updated: UserDTO = await res.json();
			setUser(updated);
			await AsyncStorage.setItem("userName", updated.name);
			if (updated.avatarUrl) await AsyncStorage.setItem("avatarUrl", updated.avatarUrl);
		} catch (err: any) {
			setError(err);
			throw err;
		}
	};

	return (
		<UserContext.Provider value={{ user, loading, error, updateProfile }}>
			{children}
		</UserContext.Provider>
	);
};

// hook to consume
export function useUser() {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser must be inside UserProvider");
	return ctx;
}
