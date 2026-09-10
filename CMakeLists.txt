cmake_minimum_required(VERSION 3.13)

project(mobile_native_barcode_generator LANGUAGES CXX)

if(MSVC)
  set(MNBG_WARNINGS /W4 /permissive- /utf-8 /EHsc)
else()
  set(MNBG_WARNINGS -Wall -Wextra -Wpedantic)
endif()

set(MNBG_CORE_SOURCES
  cpp/core/Base64.cpp
  cpp/core/BarcodeGenerator.cpp
  cpp/core/BitMatrix.cpp
  cpp/core/Code128Encoder.cpp
  cpp/core/PngEncoder.cpp
  cpp/core/QrCodeEncoder.cpp
)

if(EMSCRIPTEN)
  # `pnpm run build:wasm` drives this branch through emcmake; the artifact is a
  # single self-contained CommonJS file (the wasm binary is embedded) so that
  # consumers do not have to teach their bundler how to ship a .wasm asset.
  add_executable(mnbg_wasm
    ${MNBG_CORE_SOURCES}
    cpp/wasm/WasmBindings.cpp
  )

  target_include_directories(mnbg_wasm PRIVATE cpp)
  target_compile_features(mnbg_wasm PRIVATE cxx_std_20)
  target_compile_options(mnbg_wasm PRIVATE -Oz -fexceptions -Wall -Wextra -Wpedantic)

  set_target_properties(mnbg_wasm PROPERTIES
    OUTPUT_NAME "mnbg-wasm"
    SUFFIX ".js"
  )

  target_link_options(mnbg_wasm PRIVATE
    -Oz
    -fexceptions
    --bind
    --no-entry
    -sSINGLE_FILE=1
    -sMODULARIZE=1
    -sEXPORT_NAME=createMnbgWasmModule
    # Browser-only glue: the node branch would `require("node:fs")`, which
    # web bundlers refuse to resolve. SINGLE_FILE needs no file access, so
    # the artifact still runs under Node (SSR, tests) without that branch.
    -sENVIRONMENT=web,worker
    -sALLOW_MEMORY_GROWTH=1
    -sFILESYSTEM=0
    -sINCOMING_MODULE_JS_API=[]
    -sEXPORTED_RUNTIME_METHODS=[]
  )
elseif(ANDROID)
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
  target_compile_options(mnbg_core PRIVATE ${MNBG_WARNINGS})

  option(MNBG_BUILD_TESTS "Build the standalone C++ tests" OFF)

  if(MNBG_BUILD_TESTS)
    enable_testing()
    add_executable(mnbg_core_tests tests/cpp/core_test.cpp)
    target_link_libraries(mnbg_core_tests PRIVATE mnbg_core)
    target_compile_features(mnbg_core_tests PRIVATE cxx_std_20)
    target_compile_options(mnbg_core_tests PRIVATE ${MNBG_WARNINGS})
    add_test(NAME mnbg_core_tests COMMAND mnbg_core_tests)

    if(WIN32)
      add_executable(mnbg_windows_tests
        tests/windows/gallery_saver_test.cpp
        cpp/platform/GallerySaverWindows.cpp
      )
      target_link_libraries(mnbg_windows_tests PRIVATE mnbg_core shell32 ole32 shlwapi)
      target_compile_definitions(mnbg_windows_tests PRIVATE NOMINMAX WIN32_LEAN_AND_MEAN)
      target_compile_options(mnbg_windows_tests PRIVATE ${MNBG_WARNINGS})
      add_test(NAME mnbg_windows_tests COMMAND mnbg_windows_tests)
    endif()

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
