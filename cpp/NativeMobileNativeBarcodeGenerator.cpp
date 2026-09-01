#include "NativeMobileNativeBarcodeGenerator.h"

#include "core/BarcodeGenerator.h"
#include "platform/GallerySaver.h"

#include <cmath>
#include <cstdint>
#include <stdexcept>
#include <utility>

namespace facebook::react {
namespace {

int checkedDimension(double value, const char* label) {
  if (!std::isfinite(value) || value <= 0 || value > 6144 ||
      std::trunc(value) != value) {
    throw std::invalid_argument(
        std::string(label) + " must be a positive integer up to 6144");
  }

  return static_cast<int>(value);
}

std::string saveCode(
    mnbg::Symbology symbology,
    const std::string& value,
    double width,
    double height,
    const std::string& fileName) {
  const std::vector<std::uint8_t> png = mnbg::generatePng(
      symbology,
      value,
      checkedDimension(width, "Width"),
      checkedDimension(height, "Height"));

  return mnbg::savePngToGallery(png, fileName);
}

}  // namespace

NativeMobileNativeBarcodeGenerator::NativeMobileNativeBarcodeGenerator(
    std::shared_ptr<CallInvoker> jsInvoker)
    : NativeMobileNativeBarcodeGeneratorCxxSpec(std::move(jsInvoker)) {}

AsyncPromise<std::string> NativeMobileNativeBarcodeGenerator::generateBarcode(
    jsi::Runtime& runtime,
    std::string value,
    double width,
    double height) {
  auto promise = AsyncPromise<std::string>(runtime, jsInvoker_);

  try {
    promise.resolve(mnbg::generatePngBase64(
        mnbg::Symbology::code128,
        value,
        checkedDimension(width, "Width"),
        checkedDimension(height, "Height")));
  } catch (const std::exception& error) {
    promise.reject(Error(error.what()));
  }

  return promise;
}

AsyncPromise<std::string> NativeMobileNativeBarcodeGenerator::generateQRCode(
    jsi::Runtime& runtime,
    std::string value,
    double width,
    double height) {
  auto promise = AsyncPromise<std::string>(runtime, jsInvoker_);

  try {
    promise.resolve(mnbg::generatePngBase64(
        mnbg::Symbology::qrCode,
        value,
        checkedDimension(width, "Width"),
        checkedDimension(height, "Height")));
  } catch (const std::exception& error) {
    promise.reject(Error(error.what()));
  }

  return promise;
}

AsyncPromise<std::string>
NativeMobileNativeBarcodeGenerator::saveBarcodeToGallery(
    jsi::Runtime& runtime,
    std::string value,
    double width,
    double height,
    std::string fileName) {
  auto promise = AsyncPromise<std::string>(runtime, jsInvoker_);

  try {
    promise.resolve(
        saveCode(mnbg::Symbology::code128, value, width, height, fileName));
  } catch (const std::exception& error) {
    promise.reject(Error(error.what()));
  }

  return promise;
}

AsyncPromise<std::string>
NativeMobileNativeBarcodeGenerator::saveQRCodeToGallery(
    jsi::Runtime& runtime,
    std::string value,
    double width,
    double height,
    std::string fileName) {
  auto promise = AsyncPromise<std::string>(runtime, jsInvoker_);

  try {
    promise.resolve(
        saveCode(mnbg::Symbology::qrCode, value, width, height, fileName));
  } catch (const std::exception& error) {
    promise.reject(Error(error.what()));
  }

  return promise;
}

}  // namespace facebook::react
