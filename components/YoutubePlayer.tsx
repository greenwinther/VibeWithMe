import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";

type YouTubePlayerProps = {
	videoId: string;
	height?: number;
	onPlayPause?: (playing: boolean) => void;
};

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, height = 200, onPlayPause }) => {
	const playerRef = useRef<YoutubeIframeRef>(null);
	const [loading, setLoading] = useState(true);

	const onReady = useCallback(() => {
		setLoading(false);
	}, []);

	const onStateChange = useCallback(
		(state: "playing" | "paused" | "ended" | "buffering" | "unstarted") => {
			if (onPlayPause && (state === "playing" || state === "paused")) {
				onPlayPause(state === "playing");
			}
		},
		[onPlayPause]
	);

	return (
		<View style={[styles.container, { height }]}>
			{loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />}
			<YoutubePlayer
				ref={playerRef}
				height={height}
				play={false}
				videoId={videoId}
				onReady={onReady}
				onChangeState={onStateChange}
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
