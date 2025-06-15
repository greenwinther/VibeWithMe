import { VideoDTO } from "@/server/types";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
	onSelect: (video: VideoDTO) => void;
};

export const YouTubeSearch: React.FC<Props> = ({ onSelect }) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<VideoDTO[]>([]);
	const [debouncedQuery, setDebouncedQuery] = useState(query);

	// Update debouncedQuery 500ms after the user stops typing
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(query);
		}, 500);
		return () => clearTimeout(handler);
	}, [query]);

	// Whenever debouncedQuery changes, fire the search
	useEffect(() => {
		// if the query is empty, clear results and bail
		if (!debouncedQuery.trim()) {
			setResults([]);
			return;
		}

		const fetchResults = async () => {
			try {
				const res = await fetch(
					`http://localhost:4000/youtube-search?q=${encodeURIComponent(debouncedQuery)}`
				);
				const data: VideoDTO[] = await res.json();
				setResults(data);
			} catch (e) {
				console.error("Search error", e);
			}
		};

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
