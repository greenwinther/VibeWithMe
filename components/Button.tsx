import { Colors, Fonts } from "@/styles/theme";
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
			activeOpacity={0.8}
			disabled={disabled}
			style={[styles.button, disabled && styles.disabled, style]}
		>
			<Text style={[styles.text, textStyle]}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: Colors.primary,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	disabled: {
		opacity: 0.6,
	},
	text: {
		fontFamily: Fonts.body,
		fontSize: 16,
		color: "#fff",
	},
});
