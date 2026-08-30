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
  if (!std::isfinite(value) || value <= 0 || value > 4096 ||
      std::trunc(value) != value) {
    throw std::invalid_argument(
        std::string(label) + " must be a positive integer up to 4096");
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

std::string NativeMobileNativeBarcodeGenerator::generateBarcode(
    jsi::Runtime&,
    std::string value,
    double width,
    double height) {
  return mnbg::generatePngBase64(
      mnbg::Symbology::code128,
      value,
      checkedDimension(width, "Width"),
      checkedDimension(height, "Height"));
}

std::string NativeMobileNativeBarcodeGenerator::generateQRCode(
    jsi::Runtime&,
    std::string value,
    double width,
    double height) {
  return mnbg::generatePngBase64(
      mnbg::Symbology::qrCode,
      value,
      checkedDimension(width, "Width"),
      checkedDimension(height, "Height"));
}

std::string NativeMobileNativeBarcodeGenerator::saveBarcodeToGallery(
    jsi::Runtime&,
    std::string value,
    double width,
    double height,
    std::string fileName) {
  return saveCode(mnbg::Symbology::code128, value, width, height, fileName);
}

std::string NativeMobileNativeBarcodeGenerator::saveQRCodeToGallery(
    jsi::Runtime&,
    std::string value,
    double width,
    double height,
    std::string fileName) {
  return saveCode(mnbg::Symbology::qrCode, value, width, height, fileName);
}

}  // namespace facebook::react
