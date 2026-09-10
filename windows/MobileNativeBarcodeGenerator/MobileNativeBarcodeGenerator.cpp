#include "pch.h"

#include "MobileNativeBarcodeGenerator.h"

#include "core/BarcodeGenerator.h"
#include "platform/GallerySaver.h"

#include <cmath>
#include <stdexcept>
#include <utility>

namespace winrt::MobileNativeBarcodeGenerator {
namespace {

int checkedDimension(double value, const char* label) {
  if (!std::isfinite(value) || value <= 0 || value > 6144 ||
      std::trunc(value) != value) {
    throw std::invalid_argument(
        std::string(label) + " must be a positive integer up to 6144");
  }
  return static_cast<int>(value);
}

// Own all arguments across suspension; never capture a module instance that
// could be destroyed by a reload while encoding or writing the image.
winrt::fire_and_forget generate(
    mnbg::Symbology symbology,
    std::string value,
    double width,
    double height,
    bool save,
    std::string fileName,
    Microsoft::ReactNative::ReactPromise<std::string> promise) {
  try {
    co_await winrt::resume_background();
    const int imageWidth = checkedDimension(width, "Width");
    const int imageHeight = checkedDimension(height, "Height");
    if (save) {
      promise.Resolve(
          mnbg::savePngToGallery(
              mnbg::generatePng(symbology, value, imageWidth, imageHeight),
              fileName));
    } else {
      promise.Resolve(
          mnbg::generatePngBase64(symbology, value, imageWidth, imageHeight));
    }
  } catch (const winrt::hresult_error& error) {
    promise.Reject(winrt::to_string(error.message()).c_str());
  } catch (const std::exception& error) {
    promise.Reject(error.what());
  } catch (...) {
    promise.Reject("Could not generate or save the image");
  }
}

}  // namespace

void MobileNativeBarcodeGenerator::generateBarcode(
    std::string value,
    double width,
    double height,
    Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
  generate(
      mnbg::Symbology::code128,
      std::move(value),
      width,
      height,
      false,
      {},
      std::move(promise));
}

void MobileNativeBarcodeGenerator::generateQRCode(
    std::string value,
    double width,
    double height,
    Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
  generate(
      mnbg::Symbology::qrCode,
      std::move(value),
      width,
      height,
      false,
      {},
      std::move(promise));
}

void MobileNativeBarcodeGenerator::saveBarcodeToGallery(
    std::string value,
    double width,
    double height,
    std::string fileName,
    Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
  generate(
      mnbg::Symbology::code128,
      std::move(value),
      width,
      height,
      true,
      std::move(fileName),
      std::move(promise));
}

void MobileNativeBarcodeGenerator::saveQRCodeToGallery(
    std::string value,
    double width,
    double height,
    std::string fileName,
    Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
  generate(
      mnbg::Symbology::qrCode,
      std::move(value),
      width,
      height,
      true,
      std::move(fileName),
      std::move(promise));
}

}  // namespace winrt::MobileNativeBarcodeGenerator
