import { usePlaylist } from "@/contexts/PlaylistContext";
import { useRoom } from "@/contexts/RoomContext";
import { Colors } from "@/styles/theme";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";

/**
 * YouTubePlayer drives playback via the shared room + playlist contexts.
 * - Remounts on new videoId (key prop)
 * - Automatically plays/pauses based on isPlaying
 * - Emits seek updates and handles end-of-video to advance
 */

// Simplified props: height only; videoId and play/pause handled via contexts
export const YouTubePlayer: React.FC<{ height?: number }> = ({ height = 200 }) => {
	const playerRef = useRef<YoutubeIframeRef>(null);
	const { queue, currentIndex, nextVideo } = usePlaylist();
	const { playPause, seekPlayback, isPlaying } = useRoom();
	const [loading, setLoading] = useState(true);

	// Pick the current video from the queue
	const currentVideo = queue[currentIndex]?.video;
	const videoId = currentVideo?.videoId || "";

	// whenever videoId changes, reset loading so spinner shows
	useEffect(() => {
		setLoading(true);
	}, [videoId]);

	const onReady = useCallback(() => {
		setLoading(false);
	}, []);

	const onStateChange = useCallback(
		(state: string) => {
			console.log("🔔 player state:", state);
			if (state === "playing") playPause(true);
			if (state === "paused") playPause(false);
			if (state === "ended") nextVideo();
		},
		[playPause, nextVideo]
	);

	const onProgress = useCallback(
		({ currentTime }: { currentTime: number }) => {
			seekPlayback(currentTime);
		},
		[seekPlayback]
	);

	return (
		<View style={[styles.container, { height }]}>
			{loading && (
				<ActivityIndicator style={StyleSheet.absoluteFill} size="large" color={Colors.primary} />
			)}
			<YoutubePlayer
				key={videoId}
				ref={playerRef}
				height={height}
				play={isPlaying}
				videoId={videoId}
				onReady={onReady}
				onChangeState={onStateChange}
				onProgress={onProgress}
				webViewProps={{
					allowsInlineMediaPlayback: true,
					mediaPlaybackRequiresUserAction: false,
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		overflow: "hidden",
	},
});
