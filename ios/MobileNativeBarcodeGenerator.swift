import Foundation
import UIKit
import CoreImage

@objc(MobileNativeBarcodeGenerator)
class MobileNativeBarcodeGenerator: NSObject {
  
  @objc(generateBarcode:width:height:withResolver:withRejecter:)
  func generateBarcode(value: String, width: NSNumber, height: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    if let barcodeImage = generateCode(value: value, type: "CICode128BarcodeGenerator", width: width, height: height) {
      let base64String = convertImageToBase64(barcodeImage)
      resolve(base64String)
    } else {
      reject("Error", "Failed to generate barcode", nil)
    }
  }
  
  @objc(generateQRCode:width:height:withResolver:withRejecter:)
  func generateQRCode(value: String, width: NSNumber, height: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    if let qrImage = generateCode(value: value, type: "CIQRCodeGenerator", width: width, height: height) {
      let base64String = convertImageToBase64(qrImage)
      resolve(base64String)
    } else {
      reject("Error", "Failed to generate QR code", nil)
    }
  }
  
  @objc(saveQRCodeToGallery:width:height:fileName:withResolver:withRejecter:)
  func saveQRCodeToGallery(value: String, width: NSNumber, height: NSNumber, fileName: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    saveCodeToGallery(value: value, type: "CIQRCodeGenerator", width: width, height: height, fileName: fileName, resolve: resolve, reject: reject)
  }
  
  @objc(saveBarcodeToGallery:width:height:fileName:withResolver:withRejecter:)
  func saveBarcodeToGallery(value: String, width: NSNumber, height: NSNumber, fileName: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    saveCodeToGallery(value: value, type: "CICode128BarcodeGenerator", width: width, height: height, fileName: fileName, resolve: resolve, reject: reject)
  }

  private func generateCode(value: String, type: String, width: NSNumber, height: NSNumber) -> UIImage? {
    let data = value.data(using: .ascii)
    guard let filter = CIFilter(name: type) else { return nil }
    filter.setValue(data, forKey: "inputMessage")
    
    guard let ciImage = filter.outputImage else { return nil }
    
    let transform = CGAffineTransform(scaleX: CGFloat(truncating: width) / ciImage.extent.size.width,
                                      y: CGFloat(truncating: height) / ciImage.extent.size.height)
    let scaledImage = ciImage.transformed(by: transform)
    return UIImage(ciImage: scaledImage)
  }
  
  // Converter UIImage para Base64
  private func convertImageToBase64(_ image: UIImage) -> String {
    guard let imageData = image.pngData() else { return "" }
    return imageData.base64EncodedString(options: .endLineWithCarriageReturn)
  }
  
  // Salvar a imagem na Galeria
  private func saveCodeToGallery(value: String, type: String, width: NSNumber, height: NSNumber, fileName: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    if let image = generateCode(value: value, type: type, width: width, height: height) {
      UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
      resolve("Saved to gallery")
    } else {
      reject("Error", "Failed to save to gallery", nil)
    }
  }
}
