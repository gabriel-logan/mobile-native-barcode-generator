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
  spec.exclude_files = "cpp/platform/GallerySaverAndroid.cpp"
  spec.frameworks = "Photos"
  spec.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20"
  }

  install_modules_dependencies(spec)
end
