import { StyleSheet } from "react-native";

export const Colors = {
	primary: "#C6715E",
	secondary: "#F2C799",
	accent: "#88A09E",
	background: "#FFF6EA",
	cardBackground: "#F7E7CE",
	textPrimary: "#3D302C",
	textSecondary: "#7A675F",
	border: "#D9C3B0",
};

export const Fonts = {
	title: "Shrikhand",
	subtitle: "DMSerifDisplay",
	body: "Inter",
};

export const GlobalStyles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.background,
	},
	title: {
		fontFamily: Fonts.title,
		fontSize: 28,
		color: Colors.textPrimary,
	},
	subtitle: {
		fontFamily: Fonts.subtitle,
		fontSize: 20,
		color: Colors.textSecondary,
	},
	text: {
		fontFamily: Fonts.body,
		fontSize: 16,
		color: Colors.textPrimary,
	},
	caption: {
		fontFamily: Fonts.body,
		fontSize: 12,
		color: Colors.textSecondary,
	},
	button: {
		backgroundColor: Colors.primary,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 24,
		alignItems: "center",
	},
	buttonText: {
		fontFamily: Fonts.body,
		fontSize: 16,
		color: "white",
	},
	input: {
		backgroundColor: Colors.background,
		borderColor: Colors.border,
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontFamily: Fonts.body,
		color: Colors.textPrimary,
	},
	card: {
		backgroundColor: Colors.cardBackground,
		borderRadius: 16,
		padding: 16,
		borderColor: Colors.border,
		borderWidth: 1,
	},
});
