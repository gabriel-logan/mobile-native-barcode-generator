#include "core/BarcodeGenerator.h"
#include "platform/GallerySaverWindows.h"

#include <shlwapi.h>
#include <windows.h>

#include <filesystem>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

void require(bool condition, const char* message) {
  if (!condition) throw std::runtime_error(message);
}

std::filesystem::path pathFromUri(const std::string& uri) {
  require(uri.rfind("file:///", 0) == 0, "Expected an absolute file URI");
  const int length = MultiByteToWideChar(
      CP_UTF8, MB_ERR_INVALID_CHARS, uri.c_str(), -1, nullptr, 0);
  require(length > 0, "Invalid UTF-8 URI");
  std::wstring wide(length, L'\0');
  MultiByteToWideChar(
      CP_UTF8, MB_ERR_INVALID_CHARS, uri.c_str(), -1, wide.data(), length);
  std::wstring path(32768, L'\0');
  DWORD size = static_cast<DWORD>(path.size());
  require(
      SUCCEEDED(PathCreateFromUrlW(wide.c_str(), path.data(), &size, 0)),
      "Invalid file URI");
  path.resize(size);
  return path;
}

void testSaving(const std::filesystem::path& directory) {
  for (auto symbology : {mnbg::Symbology::code128, mnbg::Symbology::qrCode}) {
    const auto png = mnbg::generatePng(symbology, "1234567890", 300, 200);
    const auto uri = mnbg::savePngToDirectory(png, "test image #1", directory);
    require(uri.find("%20") != std::string::npos, "Spaces must be escaped");
    const auto path = pathFromUri(uri);
    require(
        path.parent_path() == directory, "Saved outside the requested folder");
    std::ifstream file(path, std::ios::binary);
    const std::vector<std::uint8_t> actual(
        (std::istreambuf_iterator<char>(file)), {});
    require(actual == png, "Saved PNG differs from the shared encoder output");
    const auto second =
        mnbg::savePngToDirectory(png, "test image #1", directory);
    require(uri != second, "Duplicate filenames must not overwrite images");
    require(
        std::filesystem::exists(pathFromUri(second)),
        "Duplicate image missing");
    const auto unicode =
        pathFromUri(mnbg::savePngToDirectory(png, "café.PNG", directory));
    require(
        unicode.extension() == L".PNG" || unicode.extension() == L".png",
        "Must retain PNG extension");
    require(
        unicode.filename().wstring().find(L"café") == 0,
        "Unicode filename was corrupted");
    for (const std::string name :
         {"",
          " ",
          "..",
          "../escape",
          "a\\b",
          "C:escape",
          "CON",
          "aux.png",
          "LPT1",
          "bad?name",
          "trailing.",
          "trailing "}) {
      bool rejected = false;
      try {
        mnbg::savePngToDirectory(png, name, directory);
      } catch (const std::exception&) {
        rejected = true;
      }
      require(rejected, "Invalid filename must reject");
    }
    bool rejected = false;
    try {
      mnbg::savePngToDirectory(png, "image", path / "not-a-directory");
    } catch (const std::exception&) {
      rejected = true;
    }
    require(rejected, "Filesystem failures must reject");
  }
}

}  // namespace

int main() {
  // CTest's working directory is the build tree; never touch the user's
  // gallery.
  const auto directory = std::filesystem::current_path() /
      (L"mnbg-gallery-test-" + std::to_wstring(GetCurrentProcessId()));
  try {
    testSaving(directory);
    std::filesystem::remove_all(directory);
    std::cout << "Windows gallery tests passed\n";
    return 0;
  } catch (const std::exception& error) {
    std::error_code ignored;
    std::filesystem::remove_all(directory, ignored);
    std::cerr << error.what() << '\n';
    return 1;
  }
}
