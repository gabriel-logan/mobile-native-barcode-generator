import type {
	StyleProp,
	ImageStyle,
	NativeSyntheticEvent,
	ImageErrorEventData,
	ImageLoadEventData,
} from "react-native";

export interface GeneralViewProps {
	testID?: string;
	value: string;
	width: number;
	height: number;
	style?: StyleProp<ImageStyle>;
	onLoad?: (event: NativeSyntheticEvent<ImageLoadEventData>) => void;
	onError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void;
}

export interface QRCodeViewProps extends GeneralViewProps {}

export interface BarcodeViewProps extends GeneralViewProps {}
