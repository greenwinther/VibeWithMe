import { VideoDTO } from "@/server/types";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
				const res = await fetch(
					`http://localhost:4000/youtube-search?q=${encodeURIComponent(debouncedQuery)}`
				);
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
			<TextInput
				placeholder="Search YouTube…"
				value={query}
				onChangeText={setQuery}
				style={styles.input}
			/>
			<FlatList
				data={results}
				keyExtractor={(item) => item.videoId}
				renderItem={({ item }) => (
					<TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
						<Image source={{ uri: item.thumbnail }} style={styles.thumb} />
						<Text style={styles.title} numberOfLines={2}>
							{item.title}
						</Text>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 8,
		margin: 8,
		borderRadius: 4,
	},
	item: {
		flexDirection: "row",
		padding: 8,
		alignItems: "center",
	},
	thumb: { width: 80, height: 45, marginRight: 12, borderRadius: 4 },
	title: { flex: 1 },
});
