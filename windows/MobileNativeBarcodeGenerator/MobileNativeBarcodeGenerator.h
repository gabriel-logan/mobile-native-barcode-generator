#pragma once

#include "NativeModules.h"
#include "codegen/NativeMobileNativeBarcodeGeneratorSpec.g.h"

#include <string>

namespace winrt::MobileNativeBarcodeGenerator {

REACT_MODULE(
    MobileNativeBarcodeGenerator,
    L"NativeMobileNativeBarcodeGenerator")
struct MobileNativeBarcodeGenerator {
  using ModuleSpec =
      MobileNativeBarcodeGeneratorCodegen::MobileNativeBarcodeGeneratorSpec;

  REACT_METHOD(generateBarcode)
  void generateBarcode(
      std::string value,
      double width,
      double height,
      Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept;

  REACT_METHOD(generateQRCode)
  void generateQRCode(
      std::string value,
      double width,
      double height,
      Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept;

  REACT_METHOD(saveBarcodeToGallery)
  void saveBarcodeToGallery(
      std::string value,
      double width,
      double height,
      std::string fileName,
      Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept;

  REACT_METHOD(saveQRCodeToGallery)
  void saveQRCodeToGallery(
      std::string value,
      double width,
      double height,
      std::string fileName,
      Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept;
};

}  // namespace winrt::MobileNativeBarcodeGenerator
