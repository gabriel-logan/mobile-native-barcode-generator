import { NavigationContainer, DarkTheme } from "@react-navigation/native";

import Routes from "./src/Routes";

export default function App() {
	return (
		<NavigationContainer theme={DarkTheme}>
			<Routes />
		</NavigationContainer>
	);
}
