```js
import { saveBarcodeToGallery, saveQRCodeToGallery } from "mobile-native-barcode-generator";

interface params {
	value: string;
	width: number;
	height: number;
	fileName: string;
}

async function buttonToSaveOnGallery() {
    const result1 = await saveBarcodeToGallery(
        "BAR_CODE", // Value
        300, // Width
        100, // height
        "CODE128", // Filename
    );

    const result2 = await saveQRCodeToGallery(
        "QR_CODE", // Value
        300, // Width
        300, // height
        "QR_CODE", // Filename
    );

    console.log("Success", `${result1} and ${result2}`);
}
```
