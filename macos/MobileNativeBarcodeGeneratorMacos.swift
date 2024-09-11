import Foundation

class MobileNativeBarcodeGeneratorMacos {
    func generateBarcode(value: String, width: Int, height: Int) -> String {
        return "\(value)\(width)\(height)barcode"
    }

    func generateQRCode(value: String, width: Int, height: Int) -> String {
        return "\(value)\(width)\(height)qrcode"
    }

    func saveQRCodeToGallery(value: String, width: Int, height: Int, fileName: String) -> String {
        return "\(value)\(width)\(height)\(fileName)saved qrcode"
    }

    func saveBarcodeToGallery(value: String, width: Int, height: Int, fileName: String) -> String {
        return "\(value)\(width)\(height)\(fileName)saved barcode"
    }
}