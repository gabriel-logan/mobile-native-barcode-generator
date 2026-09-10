#pragma once

#include "ReactPackageProvider.g.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::MobileNativeBarcodeGenerator::implementation {

struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider> {
  ReactPackageProvider() = default;

  void CreatePackage(IReactPackageBuilder const& packageBuilder) noexcept;
};

}  // namespace winrt::MobileNativeBarcodeGenerator::implementation

namespace winrt::MobileNativeBarcodeGenerator::factory_implementation {

struct ReactPackageProvider : ReactPackageProviderT<
                                  ReactPackageProvider,
                                  implementation::ReactPackageProvider> {};

}  // namespace winrt::MobileNativeBarcodeGenerator::factory_implementation
