import { Colors, Fonts } from "@/styles/theme";
import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

export interface InputFieldProps extends TextInputProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	style?: TextInputProps["style"];
}

export default function InputField({ value, onChangeText, placeholder, style, ...rest }: InputFieldProps) {
	return (
		<TextInput
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			placeholderTextColor={Colors.textSecondary}
			style={[styles.input, style]}
			{...rest}
		/>
	);
}

const styles = StyleSheet.create({
	input: {
		backgroundColor: Colors.background,
		borderColor: Colors.border,
		borderWidth: 1,
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		fontSize: 16,
		fontFamily: Fonts.body,
		color: Colors.textPrimary,
	},
});
