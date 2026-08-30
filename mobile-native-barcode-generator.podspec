require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |spec|
  spec.name = "mobile-native-barcode-generator"
  spec.version = package["version"]
  spec.summary = package["description"]
  spec.homepage = package["homepage"]
  spec.license = package["license"]
  spec.authors = package["author"]
  spec.source = {
    :git => "https://github.com/gabriel-logan/mobile-native-barcode-generator.git",
    :tag => "#{spec.version}"
  }

  spec.platforms = { :ios => min_ios_version_supported }
  spec.source_files = [
    "cpp/**/*.{h,cpp}",
    "ios/**/*.{h,mm}"
  ]
  # The Android gallery saver and the Emscripten bindings both pull in headers
  # that do not exist on iOS, and `source_files` globs the whole of `cpp/`.
  spec.exclude_files = [
    "cpp/platform/GallerySaverAndroid.cpp",
    "cpp/wasm/**/*"
  ]
  spec.frameworks = "Photos"
  spec.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20"
  }

  install_modules_dependencies(spec)
end
