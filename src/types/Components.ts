import type {
	StyleProp,
	ImageStyle,
	NativeSyntheticEvent,
	ImageErrorEventData,
	ImageLoadEventData,
} from "react-native";

type OmitWidthHeight<T> = Omit<
	T,
	"width" | "height" | "maxWidth" | "maxHeight" | "minWidth" | "minHeight"
>;

type Style = StyleProp<OmitWidthHeight<ImageStyle>>;

export interface GeneralViewProps {
	testID?: string;
	value: string;
	width: number;
	height: number;
	style?: Style;
	onLoad?: (event: NativeSyntheticEvent<ImageLoadEventData>) => void;
	onError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void;
}

export interface QRCodeViewProps extends GeneralViewProps {}

export interface BarcodeViewProps extends GeneralViewProps {}

export interface MobileNativeBarcodeGeneratorType {
	generateBarcode: (
		value: string,
		width: number,
		height: number,
	) => Promise<string>;

	generateQRCode: (
		value: string,
		width: number,
		height: number,
	) => Promise<string>;

	saveBarcodeToGallery: (
		value: string,
		width: number,
		height: number,
		fileName: string,
	) => Promise<string>;

	saveQRCodeToGallery: (
		value: string,
		width: number,
		height: number,
		fileName: string,
	) => Promise<string>;
}
