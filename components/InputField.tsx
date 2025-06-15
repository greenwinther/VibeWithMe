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
			style={[styles.input, style]}
			{...rest}
		/>
	);
}

const styles = StyleSheet.create({
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		fontSize: 16,
	},
});
