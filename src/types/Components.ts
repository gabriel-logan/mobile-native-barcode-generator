export interface GeneralViewProps {
	value: string;
	width: number;
	height: number;
}

export interface QRCodeViewProps extends GeneralViewProps {}

export interface BarcodeViewProps extends GeneralViewProps {}
