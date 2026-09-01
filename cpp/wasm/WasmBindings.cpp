#include "../core/BarcodeGenerator.h"

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <cmath>
#include <stdexcept>
#include <string>

namespace {

int checkedDimension(double value, const char* label) {
  if (!std::isfinite(value) || value <= 0 || value > 6144 ||
      std::trunc(value) != value) {
    throw std::invalid_argument(
        std::string(label) + " must be a positive integer up to 6144");
  }

  return static_cast<int>(value);
}

// Failures are reported as `{ error }` instead of being thrown across the
// wasm boundary: an unwound C++ exception only reaches JavaScript as an opaque
// pointer, which would lose the message the Android and iOS turbo modules
// reject with. The JavaScript side turns `error` back into a rejected promise.
emscripten::val generate(
    mnbg::Symbology symbology,
    const std::string& value,
    double width,
    double height) {
  emscripten::val result = emscripten::val::object();

  try {
    result.set(
        "value",
        mnbg::generatePngBase64(
            symbology,
            value,
            checkedDimension(width, "Width"),
            checkedDimension(height, "Height")));
  } catch (const std::exception& error) {
    result.set("error", std::string(error.what()));
  } catch (...) {
    result.set("error", std::string("Failed to generate the image"));
  }

  return result;
}

emscripten::val
generateBarcodeBase64(const std::string& value, double width, double height) {
  return generate(mnbg::Symbology::code128, value, width, height);
}

emscripten::val
generateQRCodeBase64(const std::string& value, double width, double height) {
  return generate(mnbg::Symbology::qrCode, value, width, height);
}

}  // namespace

EMSCRIPTEN_BINDINGS(mobile_native_barcode_generator) {
  emscripten::function("generateBarcodeBase64", &generateBarcodeBase64);
  emscripten::function("generateQRCodeBase64", &generateQRCodeBase64);
}
