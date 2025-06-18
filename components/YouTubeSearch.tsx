import { API_BASE } from "@/server/src/lib/api";
import { VideoDTO } from "@/server/types";
import { Colors, Fonts } from "@/styles/theme";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InputField from "./InputField";

interface YouTubeSearchProps {
	onSelect: (video: VideoDTO) => void;
}

export const YouTubeSearch: React.FC<YouTubeSearchProps> = ({ onSelect }) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<VideoDTO[]>([]);
	const [debouncedQuery, setDebouncedQuery] = useState(query);

	// Debounce query input
	useEffect(() => {
		const handler = setTimeout(() => setDebouncedQuery(query), 500);
		return () => clearTimeout(handler);
	}, [query]);

	// Fetch results when debounced query changes
	useEffect(() => {
		if (!debouncedQuery.trim()) {
			setResults([]);
			return;
		}
		async function fetchResults() {
			try {
				const res = await fetch(`${API_BASE}/youtube-search?q=${encodeURIComponent(debouncedQuery)}`);
				const data = (await res.json()) as VideoDTO[];
				setResults(data);
			} catch (err) {
				console.error("YouTube search error", err);
			}
		}
		fetchResults();
	}, [debouncedQuery]);

	return (
		<View style={styles.container}>
			<InputField
				value={query}
				onChangeText={setQuery}
				placeholder="Search YouTube…"
				style={styles.input}
			/>
			<FlatList
				data={results}
				keyExtractor={(item) => item.videoId}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.item}
						onPress={() => {
							onSelect(item);
							setQuery("");
						}}
						activeOpacity={0.7}
					>
						<Image source={{ uri: item.thumbnail }} style={styles.thumb} />
						<Text style={styles.title} numberOfLines={2}>
							{item.title}
						</Text>
					</TouchableOpacity>
				)}
				style={styles.resultsList}
				showsVerticalScrollIndicator={true}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	input: {
		margin: 8,
	},
	item: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.cardBackground,
		borderColor: Colors.border,
		borderWidth: 1,
		borderRadius: 12,
		padding: 10,
		marginHorizontal: 8,
		marginVertical: 6,
	},
	thumb: {
		width: 80,
		height: 45,
		borderRadius: 6,
		marginRight: 12,
	},
	title: {
		flex: 1,
		fontFamily: Fonts.body,
		fontSize: 14,
		color: Colors.textPrimary,
	},
	resultsList: {
		flex: 1,
	},
});
