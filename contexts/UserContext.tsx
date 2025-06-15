import { UserDTO } from "@/server/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
				const id = await AsyncStorage.getItem("userId");
				if (!id) throw new Error("No userId");
				const res = await fetch(`http://localhost:4000/users/${id}`);
				if (!res.ok) throw new Error("Fetch failed");
				const u: UserDTO = await res.json();
				setUser(u);
			} catch (err: any) {
				setError(err);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// updateProfile API + persist to AsyncStorage
	const updateProfile = async (data: Partial<Pick<UserDTO, "name" | "avatarUrl">>) => {
		if (!user) throw new Error("Not logged in");
		try {
			const res = await fetch(`http://localhost:4000/users/${user.id}`, {
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
