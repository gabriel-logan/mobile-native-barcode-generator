@objc(MobileNativeBarcodeGenerator)
class MobileNativeBarcodeGenerator: NSObject {

  @objc(generateBarcode:withResolver:withRejecter:)
  func generateBarcode(data: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve("Generated Barcode")
  }

  @objc(generateQRCode:withResolver:withRejecter:)
  func generateQRCode(data: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve("Generated QR Code")
  }
}