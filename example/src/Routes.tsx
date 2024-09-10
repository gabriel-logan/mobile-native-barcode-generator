import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MainPage from "./Main";
import TestBarCodeView from "./TestBarCodeView";
import TestGeneratingFuncs from "./TestGeneratingFuncs";
import TestQRCodeView from "./TestQRCodeView";
import TestSavingGalleryFuncs from "./TestSavingGalleryFuncs";

const Tab = createBottomTabNavigator();

function Routes() {
	return (
		<Tab.Navigator>
			<Tab.Screen name="Main" component={MainPage} />
			<Tab.Screen name="TestQRCodeView" component={TestQRCodeView} />
			<Tab.Screen name="TestBarCodeView" component={TestBarCodeView} />
			<Tab.Screen name="TestGeneratingFuncs" component={TestGeneratingFuncs} />
			<Tab.Screen
				name="TestSavingGalleryFuncs"
				component={TestSavingGalleryFuncs}
			/>
		</Tab.Navigator>
	);
}

export default Routes;
