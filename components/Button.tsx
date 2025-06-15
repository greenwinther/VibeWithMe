import React from "react";
import {
	GestureResponderEvent,
	StyleSheet,
	Text,
	TextStyle,
	TouchableOpacity,
	ViewStyle,
} from "react-native";

export interface ButtonProps {
	title: string;
	onPress: (event: GestureResponderEvent) => void;
	disabled?: boolean;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

export default function Button({ title, onPress, disabled = false, style, textStyle }: ButtonProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			disabled={disabled}
			style={[styles.button, disabled && styles.disabled, style]}
		>
			<Text style={[styles.text, textStyle]}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	disabled: {
		opacity: 0.6,
	},
	text: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
