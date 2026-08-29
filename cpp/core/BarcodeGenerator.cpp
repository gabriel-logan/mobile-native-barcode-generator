#include "BarcodeGenerator.h"

#include "Base64.h"
#include "Code128Encoder.h"
#include "PngEncoder.h"
#include "QrCodeEncoder.h"

#include <stdexcept>

namespace mnbg {
namespace {

constexpr int maximumDimension = 4096;

void validateDimensions(int width, int height) {
  if (width <= 0 || height <= 0) {
    throw std::invalid_argument("Image dimensions must be positive");
  }

  if (width > maximumDimension || height > maximumDimension) {
    throw std::invalid_argument("Image dimensions must not exceed 4096 pixels");
  }
}

}  // namespace

std::vector<std::uint8_t> generatePng(
    Symbology symbology,
    const std::string& value,
    int width,
    int height) {
  validateDimensions(width, height);

  switch (symbology) {
    case Symbology::code128:
      return encodeMonochromePng(
          encodeCode128(value), width, height, 10, 0);
    case Symbology::qrCode:
      return encodeMonochromePng(
          encodeQrCode(value), width, height, 4, 4);
  }

  throw std::logic_error("Unsupported barcode symbology");
}

std::string generatePngBase64(
    Symbology symbology,
    const std::string& value,
    int width,
    int height) {
  return encodeBase64(generatePng(symbology, value, width, height));
}

}  // namespace mnbg
