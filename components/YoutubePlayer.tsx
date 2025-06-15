import { usePlaylist } from "@/contexts/PlaylistContext";
import { useRoom } from "@/contexts/RoomContext";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";

// Simplified props: height only; videoId and play/pause handled via contexts
export const YouTubePlayer: React.FC<{ height?: number }> = ({ height = 200 }) => {
	const playerRef = useRef<YoutubeIframeRef>(null);
	const { queue, currentIndex } = usePlaylist();
	const { playPause, seekPlayback, isPlaying } = useRoom();
	const [loading, setLoading] = useState(true);

	// Pick the current video from the queue
	const currentVideo = queue[currentIndex]?.video;
	const videoId = currentVideo?.videoId || "";

	const onReady = useCallback(() => {
		setLoading(false);
	}, []);

	const onStateChange = useCallback(
		(state: string) => {
			if (state === "playing") playPause(true);
			if (state === "paused") playPause(false);
		},
		[playPause]
	);

	const onProgress = useCallback(
		({ currentTime }: { currentTime: number }) => {
			seekPlayback(currentTime);
		},
		[seekPlayback]
	);

	return (
		<View style={[styles.container, { height }]}>
			{loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />}
			<YoutubePlayer
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
		backgroundColor: "black",
		overflow: "hidden",
	},
});
