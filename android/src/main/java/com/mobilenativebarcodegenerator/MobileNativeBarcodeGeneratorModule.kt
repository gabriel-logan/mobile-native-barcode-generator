package com.mobilenativebarcodegenerator

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.common.BitMatrix

import android.graphics.Bitmap
import android.graphics.Color

class MobileNativeBarcodeGeneratorModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun generateBarcode(value: String, width: Int, height: Int, promise: Promise) {
    try {
      val bitMatrix: BitMatrix = MultiFormatWriter().encode(value, BarcodeFormat.CODE_128, width, height)
      val bitmap = bitMatrixToBitmap(bitMatrix)

      val base64Bitmap = bitmapToBase64(bitmap)
      promise.resolve(base64Bitmap)
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  @ReactMethod
  fun generateQRCode(value: String, width: Int, height: Int, promise: Promise) {
    try {
      val bitMatrix: BitMatrix = MultiFormatWriter().encode(value, BarcodeFormat.QR_CODE, width, height)
      val bitmap = bitMatrixToBitmap(bitMatrix)
      // Convert the bitmap to a format that can be returned to React Native
      // This might involve converting it to a Base64 string or saving it to a file and returning the file path
      // For simplicity, let's assume we convert it to a Base64 string
      val base64Bitmap = bitmapToBase64(bitmap)
      promise.resolve(base64Bitmap)
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  private fun bitMatrixToBitmap(bitMatrix: BitMatrix): Bitmap {
    val width = bitMatrix.width
    val height = bitMatrix.height
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    for (x in 0 until width) {
      for (y in 0 until height) {
        bitmap.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
      }
    }
    return bitmap
  }

  private fun bitmapToBase64(bitmap: Bitmap): String {
    val byteArrayOutputStream = java.io.ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
    val byteArray = byteArrayOutputStream.toByteArray()
    return android.util.Base64.encodeToString(byteArray, android.util.Base64.DEFAULT)
  }

  companion object {
    const val NAME = "MobileNativeBarcodeGenerator"
  }
}
