#include "core/BarcodeGenerator.h"
#include "core/Base64.h"
#include "core/Code128Encoder.h"
#include "core/QrCodeEncoder.h"

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
}

void testCode128() {
  const mnbg::BitMatrix matrix = mnbg::encodeCode128("123");
  require(matrix.width() == 68, "Unexpected CODE_128 module width");
  require(matrix.height() == 1, "Unexpected CODE_128 module height");
  require(matrix.get(0, 0), "CODE_128 must begin with a dark module");

  bool rejectedUnicode = false;

  try {
    static_cast<void>(mnbg::encodeCode128("ol\xC3\xA1"));
  } catch (const std::invalid_argument&) {
    rejectedUnicode = true;
  }

  require(rejectedUnicode, "CODE_128 must reject non-ASCII input");
}

void testQrCode() {
  const mnbg::BitMatrix small = mnbg::encodeQrCode("HELLO WORLD");
  require(small.width() == 21, "Short QR code must use version 1");
  require(small.height() == 21, "QR code matrix must be square");

  const mnbg::BitMatrix large = mnbg::encodeQrCode(std::string(2500, 'a'));
  require(large.width() <= 177, "QR code exceeded Model 2 version 40");
  require(large.width() > 21, "Long QR code did not increase its version");
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

  const std::string base64 =
      mnbg::generatePngBase64(mnbg::Symbology::code128, "123456", 300, 100);
  require(base64.starts_with("iVBORw0KGgo"), "PNG Base64 prefix is invalid");
}

}  // namespace

int main() {
  try {
    testBase64();
    testCode128();
    testQrCode();
    testPng();
  } catch (const std::exception& error) {
    std::cerr << error.what() << '\n';
    return 1;
  }

  std::cout << "All C++ core tests passed\n";
  return 0;
}
