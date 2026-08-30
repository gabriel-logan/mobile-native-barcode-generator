#include "Base64.h"

namespace mnbg {

std::string encodeBase64(const std::vector<std::uint8_t>& data) {
  static constexpr char alphabet[] =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  std::string result;
  result.reserve(((data.size() + 2) / 3) * 4);

  for (std::size_t offset = 0; offset < data.size(); offset += 3) {
    const std::uint32_t first = data[offset];
    const std::uint32_t second =
        offset + 1 < data.size() ? data[offset + 1] : 0;
    const std::uint32_t third = offset + 2 < data.size() ? data[offset + 2] : 0;
    const std::uint32_t value = (first << 16) | (second << 8) | third;

    result.push_back(alphabet[(value >> 18) & 0x3F]);
    result.push_back(alphabet[(value >> 12) & 0x3F]);
    result.push_back(
        offset + 1 < data.size() ? alphabet[(value >> 6) & 0x3F] : '=');
    result.push_back(offset + 2 < data.size() ? alphabet[value & 0x3F] : '=');
  }

  return result;
}

}  // namespace mnbg
