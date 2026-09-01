#include "core/BarcodeGenerator.h"
#include "core/Base64.h"
#include "core/BitMatrix.h"
#include "core/Code128Encoder.h"
#include "core/PngEncoder.h"
#include "core/QrCodeEncoder.h"

#include <algorithm>
#include <cstdint>
#include <exception>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

void require(bool condition, const std::string& message) {
  if (!condition) {
    throw std::runtime_error(message);
  }
}

template <typename Exception, typename Operation>
void requireThrows(Operation operation, const std::string& message) {
  bool threwExpectedException = false;

  try {
    operation();
  } catch (const Exception&) {
    threwExpectedException = true;
  }

  require(threwExpectedException, message);
}

std::uint32_t readUint32(
    const std::vector<std::uint8_t>& bytes,
    std::size_t offset) {
  return static_cast<std::uint32_t>(bytes.at(offset)) << 24 |
      static_cast<std::uint32_t>(bytes.at(offset + 1)) << 16 |
      static_cast<std::uint32_t>(bytes.at(offset + 2)) << 8 |
      static_cast<std::uint32_t>(bytes.at(offset + 3));
}

void testBase64() {
  require(mnbg::encodeBase64({}) == "", "Empty Base64 input failed");
  require(
      mnbg::encodeBase64({'f'}) == "Zg==", "Single-byte Base64 input failed");
  require(
      mnbg::encodeBase64({'f', 'o'}) == "Zm8=", "Two-byte Base64 input failed");
  require(
      mnbg::encodeBase64({'f', 'o', 'o'}) == "Zm9v",
      "Three-byte Base64 input failed");
  require(
      mnbg::encodeBase64({0x00, 0xFF, 0x10}) == "AP8Q",
      "Binary Base64 input failed");
}

void testBitMatrix() {
  mnbg::BitMatrix matrix(3, 2);
  require(matrix.width() == 3, "BitMatrix width is invalid");
  require(matrix.height() == 2, "BitMatrix height is invalid");
  require(!matrix.get(1, 1), "BitMatrix must initialize modules as light");

  matrix.set(1, 1);
  require(matrix.get(1, 1), "BitMatrix did not set a dark module");
  matrix.set(1, 1, false);
  require(!matrix.get(1, 1), "BitMatrix did not clear a module");

  requireThrows<std::invalid_argument>(
      [] { static_cast<void>(mnbg::BitMatrix(0, 1)); },
      "BitMatrix accepted a zero width");
  requireThrows<std::out_of_range>(
      [&matrix] { static_cast<void>(matrix.get(-1, 0)); },
      "BitMatrix accepted a negative read coordinate");
  requireThrows<std::out_of_range>(
      [&matrix] { matrix.set(3, 0); },
      "BitMatrix accepted an out-of-range write coordinate");
}

void testCode128() {
  const mnbg::BitMatrix matrix = mnbg::encodeCode128("123");
  require(matrix.width() == 68, "Unexpected CODE_128 module width");
  require(matrix.height() == 1, "Unexpected CODE_128 module height");
  require(matrix.get(0, 0), "CODE_128 must begin with a dark module");
  require(matrix.get(matrix.width() - 1, 0), "CODE_128 stop must end dark");
  require(
      mnbg::encodeCode128("12").width() == 46,
      "Two digits must use CODE_128 set C");
  require(
      mnbg::encodeCode128("AB").width() == 57,
      "Text must use CODE_128 set B");
  require(
      mnbg::encodeCode128(std::string(1, '\x01')).width() == 46,
      "Control characters must use CODE_128 set A");

  requireThrows<std::invalid_argument>(
      [] { static_cast<void>(mnbg::encodeCode128("")); },
      "CODE_128 must reject empty input");
  requireThrows<std::invalid_argument>(
      [] { static_cast<void>(mnbg::encodeCode128("ol\xC3\xA1")); },
      "CODE_128 must reject non-ASCII input");
}

void testQrCode() {
  const mnbg::BitMatrix small = mnbg::encodeQrCode("HELLO WORLD");
  require(small.width() == 21, "Short QR code must use version 1");
  require(small.height() == 21, "QR code matrix must be square");

  const mnbg::BitMatrix large = mnbg::encodeQrCode(std::string(2500, 'a'));
  require(large.width() <= 177, "QR code exceeded Model 2 version 40");
  require(large.width() > 21, "Long QR code did not increase its version");

  requireThrows<std::invalid_argument>(
      [] { static_cast<void>(mnbg::encodeQrCode("")); },
      "QR code must reject empty input");
  requireThrows<std::length_error>(
      [] { static_cast<void>(mnbg::encodeQrCode(std::string(3000, 'a'))); },
      "QR code must reject data above version 40 capacity");
}

void testPng() {
  const std::vector<std::uint8_t> png =
      mnbg::generatePng(mnbg::Symbology::qrCode, "native-cpp", 257, 193);
  const std::vector<std::uint8_t> signature = {
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

  require(png.size() > 64, "PNG output is unexpectedly small");
  require(
      std::equal(signature.begin(), signature.end(), png.begin()),
      "PNG signature is invalid");
  require(readUint32(png, 16) == 257, "PNG width is invalid");
  require(readUint32(png, 20) == 193, "PNG height is invalid");
  require(
      std::search(png.begin(), png.end(), std::begin("IHDR"), std::end("IHDR") - 1) !=
          png.end(),
      "PNG IHDR chunk is missing");
  require(
      std::search(png.begin(), png.end(), std::begin("IDAT"), std::end("IDAT") - 1) !=
          png.end(),
      "PNG IDAT chunk is missing");
  require(
      std::search(png.begin(), png.end(), std::begin("IEND"), std::end("IEND") - 1) !=
          png.end(),
      "PNG IEND chunk is missing");

  const std::string base64 =
      mnbg::generatePngBase64(mnbg::Symbology::code128, "123456", 300, 100);
  require(base64.starts_with("iVBORw0KGgo"), "PNG Base64 prefix is invalid");

  mnbg::BitMatrix modules(1, 1);
  modules.set(0, 0);
  const std::vector<std::uint8_t> scaled =
      mnbg::encodeMonochromePng(modules, 3, 2, 0, 0);
  require(readUint32(scaled, 16) == 3, "Scaled PNG width is invalid");
  require(readUint32(scaled, 20) == 2, "Scaled PNG height is invalid");

  requireThrows<std::invalid_argument>(
      [&modules] {
        static_cast<void>(mnbg::encodeMonochromePng(modules, 0, 1, 0, 0));
      },
      "PNG encoder accepted zero output width");
  requireThrows<std::invalid_argument>(
      [&modules] {
        static_cast<void>(mnbg::encodeMonochromePng(modules, 1, 1, -1, 0));
      },
      "PNG encoder accepted a negative margin");
}

void testGeneratorValidation() {
  requireThrows<std::invalid_argument>(
      [] {
        static_cast<void>(
            mnbg::generatePng(mnbg::Symbology::qrCode, "value", 0, 100));
      },
      "Generator accepted a zero dimension");
  requireThrows<std::invalid_argument>(
      [] {
        static_cast<void>(
            mnbg::generatePng(mnbg::Symbology::qrCode, "value", 100, 6145));
      },
      "Generator accepted a dimension above 6144");
  requireThrows<std::logic_error>(
      [] {
        static_cast<void>(mnbg::generatePng(
            // Exercise the defensive fallback for values outside the public enum.
            // NOLINTNEXTLINE(clang-analyzer-optin.core.EnumCastOutOfRange)
            static_cast<mnbg::Symbology>(99), "value", 100, 100));
      },
      "Generator accepted an unsupported symbology");
}

}  // namespace

int main() {
  try {
    testBase64();
    testBitMatrix();
    testCode128();
    testQrCode();
    testPng();
    testGeneratorValidation();
  } catch (const std::exception& error) {
    std::cerr << error.what() << '\n';
    return 1;
  }

  std::cout << "All C++ core tests passed\n";
  return 0;
}
