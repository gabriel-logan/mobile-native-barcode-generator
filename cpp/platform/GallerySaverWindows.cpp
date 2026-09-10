#include "GallerySaverWindows.h"
#include "GallerySaver.h"

#include <shlobj.h>
#include <shlwapi.h>
#include <windows.h>

#include <algorithm>
#include <cwctype>
#include <limits>
#include <memory>
#include <stdexcept>
#include <system_error>

namespace mnbg {
namespace {

void checkWindows(bool success, const char* message) {
  if (!success) {
    throw std::system_error(
        static_cast<int>(GetLastError()), std::system_category(), message);
  }
}

std::wstring toWide(const std::string& value) {
  if (value.empty() || value.size() > 1024) {
    throw std::invalid_argument(
        "Filename must contain between 1 and 1024 UTF-8 bytes");
  }
  const int length = MultiByteToWideChar(
      CP_UTF8,
      MB_ERR_INVALID_CHARS,
      value.data(),
      static_cast<int>(value.size()),
      nullptr,
      0);
  checkWindows(length != 0, "Invalid UTF-8 filename");
  std::wstring result(length, L'\0');
  checkWindows(
      MultiByteToWideChar(
          CP_UTF8,
          MB_ERR_INVALID_CHARS,
          value.data(),
          static_cast<int>(value.size()),
          result.data(),
          length) != 0,
      "Invalid UTF-8 filename");
  return result;
}

std::wstring pngName(const std::string& value) {
  auto name = toWide(value);
  if (name.size() > 200 || name.back() == L'.' || name.back() == L' ' ||
      name.find_first_of(L"<>:\"/\\|?*") != std::wstring::npos ||
      std::any_of(name.begin(), name.end(), [](wchar_t c) { return c < 32; })) {
    throw std::invalid_argument("Invalid Windows filename");
  }
  auto upper = name.substr(0, name.find(L'.'));
  std::transform(upper.begin(), upper.end(), upper.begin(), [](wchar_t c) {
    return static_cast<wchar_t>(std::towupper(c));
  });
  if (upper == L"CON" || upper == L"PRN" || upper == L"AUX" ||
      upper == L"NUL" ||
      (upper.size() == 4 &&
       (upper.substr(0, 3) == L"COM" || upper.substr(0, 3) == L"LPT") &&
       (upper[3] >= L'1' && upper[3] <= L'9'))) {
    throw std::invalid_argument("Reserved Windows filename");
  }
  if (name.size() < 4 ||
      _wcsicmp(name.c_str() + name.size() - 4, L".png") != 0) {
    name += L".png";
  }
  return name;
}

std::string fileUri(const std::filesystem::path& path) {
  // UrlCreateFromPath escapes spaces, Unicode and URI delimiters correctly.
  std::wstring uri(32768, L'\0');
  DWORD length = static_cast<DWORD>(uri.size());
  if (FAILED(UrlCreateFromPathW(path.c_str(), uri.data(), &length, 0))) {
    throw std::runtime_error("Could not create the saved image URI");
  }
  const int size = WideCharToMultiByte(
      CP_UTF8,
      0,
      uri.data(),
      static_cast<int>(length),
      nullptr,
      0,
      nullptr,
      nullptr);
  checkWindows(size != 0, "Could not encode the saved image URI");
  std::string result(size, '\0');
  checkWindows(
      WideCharToMultiByte(
          CP_UTF8,
          0,
          uri.data(),
          static_cast<int>(length),
          result.data(),
          size,
          nullptr,
          nullptr) != 0,
      "Could not encode the saved image URI");
  return result;
}

struct HandleCloser {
  void operator()(void* handle) const noexcept {
    CloseHandle(handle);
  }
};

}  // namespace

std::string savePngToDirectory(
    const std::vector<std::uint8_t>& png,
    const std::string& fileName,
    const std::filesystem::path& directory) {
  const auto name = pngName(fileName);
  if (png.empty() || png.size() > (std::numeric_limits<DWORD>::max)()) {
    throw std::invalid_argument("Invalid PNG data size");
  }
  std::filesystem::create_directories(directory);
  const auto stem = name.substr(0, name.size() - 4);
  for (unsigned int suffix = 0; suffix < 10000; ++suffix) {
    const auto path = std::filesystem::absolute(
        directory /
        (suffix == 0 ? name
                     : stem + L" (" + std::to_wstring(suffix) + L").png"));
    const auto uri = fileUri(path);
    HANDLE raw = CreateFileW(
        path.c_str(),
        GENERIC_WRITE,
        0,
        nullptr,
        CREATE_NEW,
        FILE_ATTRIBUTE_NORMAL,
        nullptr);
    if (raw == INVALID_HANDLE_VALUE) {
      if (GetLastError() == ERROR_FILE_EXISTS ||
          GetLastError() == ERROR_ALREADY_EXISTS) {
        continue;
      }
      checkWindows(false, "Could not create the image file");
    }
    std::unique_ptr<void, HandleCloser> handle(raw);
    try {
      DWORD written = 0;
      checkWindows(
          WriteFile(
              raw,
              png.data(),
              static_cast<DWORD>(png.size()),
              &written,
              nullptr) != 0,
          "Could not write the image file");
      if (written != png.size()) {
        throw std::runtime_error("Could not write the complete image file");
      }
      checkWindows(
          FlushFileBuffers(raw) != 0, "Could not flush the image file");
    } catch (...) {
      handle.reset();
      DeleteFileW(path.c_str());
      throw;
    }
    return uri;
  }
  throw std::runtime_error("Too many images with the same filename");
}

std::string savePngToGallery(
    const std::vector<std::uint8_t>& png,
    const std::string& fileName) {
  PWSTR raw = nullptr;
  const HRESULT result =
      SHGetKnownFolderPath(FOLDERID_Pictures, KF_FLAG_CREATE, nullptr, &raw);
  std::unique_ptr<wchar_t, decltype(&CoTaskMemFree)> pictures(
      raw, CoTaskMemFree);
  if (FAILED(result)) {
    throw std::system_error(
        static_cast<int>(result),
        std::system_category(),
        "Could not locate the Pictures folder");
  }
  return savePngToDirectory(
      png,
      fileName,
      std::filesystem::path(pictures.get()) / L"MobileNativeBarcodeGenerator");
}

}  // namespace mnbg
