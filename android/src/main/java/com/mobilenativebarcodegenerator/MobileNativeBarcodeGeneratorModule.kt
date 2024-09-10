package com.mobilenativebarcodegenerator

import android.Manifest
import android.app.Activity
import android.content.ContentValues
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.common.BitMatrix

import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.OutputStream

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

  @ReactMethod
  fun saveQRCodeToGallery(value: String, width: Int, height: Int, fileName: String, promise: Promise) {
    try {
      val bitMatrix: BitMatrix = MultiFormatWriter().encode(value, BarcodeFormat.QR_CODE, width, height)
      val bitmap = bitMatrixToBitmap(bitMatrix)
      val uri = saveBitmapToGallery(reactApplicationContext, bitmap, fileName)
      if (uri != null) {
        promise.resolve(uri.toString())
      } else {
        promise.reject("ERROR", "Failed to save QR code to gallery")
      }
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  @ReactMethod
  fun saveBarcodeToGallery(value: String, width: Int, height: Int, fileName: String, promise: Promise) {
    try {
      val bitMatrix: BitMatrix = MultiFormatWriter().encode(value, BarcodeFormat.CODE_128, width, height)
      val bitmap = bitMatrixToBitmap(bitMatrix)
      val uri = saveBitmapToGallery(reactApplicationContext, bitmap, fileName)
      if (uri != null) {
        promise.resolve(uri.toString())
      } else {
        promise.reject("ERROR", "Failed to save barcode to gallery")
      }
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  private fun saveBitmapToGallery(context: Context, bitmap: Bitmap, fileName: String): Uri? {
    val resolver = context.contentResolver
    val contentValues = ContentValues().apply {
      put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
      put(MediaStore.MediaColumns.MIME_TYPE, "image/png")
      put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES)
    }

    val uri: Uri? = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
    uri?.let {
      resolver.openOutputStream(it)?.use { outputStream ->
        if (!bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)) {
          throw IOException("Failed to save bitmap.")
        }
      } ?: throw IOException("Failed to get output stream.")
    }
    return uri
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
