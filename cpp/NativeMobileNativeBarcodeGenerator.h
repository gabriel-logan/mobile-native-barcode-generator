#pragma once

#include <RNMobileNativeBarcodeGeneratorSpecJSI.h>
#include <react/bridging/Promise.h>

#include <memory>
#include <string>

namespace facebook::react {

class NativeMobileNativeBarcodeGenerator final
    : public NativeMobileNativeBarcodeGeneratorCxxSpec<
          NativeMobileNativeBarcodeGenerator> {
 public:
  explicit NativeMobileNativeBarcodeGenerator(
      std::shared_ptr<CallInvoker> jsInvoker);

  AsyncPromise<std::string> generateBarcode(
      jsi::Runtime& runtime,
      std::string value,
      double width,
      double height);

  AsyncPromise<std::string> generateQRCode(
      jsi::Runtime& runtime,
      std::string value,
      double width,
      double height);

  AsyncPromise<std::string> saveBarcodeToGallery(
      jsi::Runtime& runtime,
      std::string value,
      double width,
      double height,
      std::string fileName);

  AsyncPromise<std::string> saveQRCodeToGallery(
      jsi::Runtime& runtime,
      std::string value,
      double width,
      double height,
      std::string fileName);
};

}  // namespace facebook::react
