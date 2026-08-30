#include "GallerySaverUtils.h"

#include <exception>
#include <iostream>
#include <stdexcept>
#include <string>

namespace {

void require(bool condition, const std::string& message) {
  if (!condition) {
    throw std::runtime_error(message);
  }
}

void testGalleryFileNameNormalization() {
  require(
      mnbg::normalizeGalleryFileName("barcode") == "barcode.png",
      "Missing PNG extension was not added");
  require(
      mnbg::normalizeGalleryFileName("barcode.png") == "barcode.png",
      "Existing PNG extension was duplicated");
  require(
      mnbg::normalizeGalleryFileName("folder/barcode") ==
          "folder_barcode.png",
      "Forward slash was not sanitized");
  require(
      mnbg::normalizeGalleryFileName("folder\\barcode.png") ==
          "folder_barcode.png",
      "Backslash was not sanitized");
}

}  // namespace

int main() {
  try {
    testGalleryFileNameNormalization();
  } catch (const std::exception& error) {
    std::cerr << error.what() << '\n';
    return 1;
  }

  std::cout << "All Objective-C++ unit tests passed\n";
  return 0;
}
