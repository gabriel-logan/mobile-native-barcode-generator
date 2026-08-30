#pragma once

#include <RNMobileNativeBarcodeGeneratorSpecJSI.h>

#include <memory>
#include <string>

namespace facebook::react {

class NativeMobileNativeBarcodeGenerator final
    : public NativeMobileNativeBarcodeGeneratorCxxSpec<
          NativeMobileNativeBarcodeGenerator> {
 public:
  explicit NativeMobileNativeBarcodeGenerator(
      std::shared_ptr<CallInvoker> jsInvoker);

  std::string generateBarcode(
      jsi::Runtime& runtime,
      std::string value,
      double width,
      double height);

  std::string generateQRCode(
      jsi::Runtime& runtime,
      std::string value,
      double width,
      double height);

  std::string saveBarcodeToGallery(
      jsi::Runtime& runtime,
      std::string value,
      double width,
      double height,
      std::string fileName);

  std::string saveQRCodeToGallery(
      jsi::Runtime& runtime,
      std::string value,
      double width,
      double height,
      std::string fileName);
};

}  // namespace facebook::react
