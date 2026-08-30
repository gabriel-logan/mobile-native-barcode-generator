cmake_minimum_required(VERSION 3.13)

project(mobile_native_barcode_generator LANGUAGES CXX)

set(MNBG_CORE_SOURCES
  cpp/core/Base64.cpp
  cpp/core/BarcodeGenerator.cpp
  cpp/core/BitMatrix.cpp
  cpp/core/Code128Encoder.cpp
  cpp/core/PngEncoder.cpp
  cpp/core/QrCodeEncoder.cpp
)

if(ANDROID)
  add_library(mobile_native_barcode_generator STATIC
    ${MNBG_CORE_SOURCES}
    cpp/NativeMobileNativeBarcodeGenerator.cpp
    cpp/platform/GallerySaverAndroid.cpp
  )

  target_include_directories(mobile_native_barcode_generator PUBLIC cpp)
  target_compile_features(mobile_native_barcode_generator PUBLIC cxx_std_20)
  target_compile_options(mobile_native_barcode_generator PRIVATE
    -fexceptions
    -frtti
    -Wall
    -Wextra
  )

  target_link_libraries(mobile_native_barcode_generator
    react_codegen_RNMobileNativeBarcodeGeneratorSpec
    android
    log
  )
else()
  add_library(mnbg_core STATIC ${MNBG_CORE_SOURCES})
  target_include_directories(mnbg_core PUBLIC cpp)
  target_compile_features(mnbg_core PUBLIC cxx_std_20)
  target_compile_options(mnbg_core PRIVATE -Wall -Wextra -Wpedantic)

  option(MNBG_BUILD_TESTS "Build the standalone C++ tests" OFF)

  if(MNBG_BUILD_TESTS)
    enable_testing()
    add_executable(mnbg_core_tests tests/cpp/core_test.cpp)
    target_link_libraries(mnbg_core_tests PRIVATE mnbg_core)
    target_compile_features(mnbg_core_tests PRIVATE cxx_std_20)
    target_compile_options(mnbg_core_tests PRIVATE -Wall -Wextra -Wpedantic)
    add_test(NAME mnbg_core_tests COMMAND mnbg_core_tests)

    if(APPLE)
      enable_language(OBJCXX)
      add_executable(mnbg_ios_tests
        tests/ios/gallery_saver_utils_test.mm
        ios/GallerySaverUtils.mm
      )
      target_include_directories(mnbg_ios_tests PRIVATE ios)
      set_target_properties(mnbg_ios_tests PROPERTIES
        OBJCXX_STANDARD 20
        OBJCXX_STANDARD_REQUIRED YES
        OBJCXX_EXTENSIONS NO
      )
      target_compile_options(mnbg_ios_tests PRIVATE -Wall -Wextra -Wpedantic)
      add_test(NAME mnbg_ios_tests COMMAND mnbg_ios_tests)
    endif()
  endif()
endif()
