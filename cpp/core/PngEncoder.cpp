#include "PngEncoder.h"

#include <algorithm>
#include <array>
#include <cstddef>
#include <cstdint>
#include <stdexcept>
#include <string_view>
#include <vector>

namespace mnbg {
namespace {

void appendUint32(std::vector<std::uint8_t>& output, std::uint32_t value) {
  output.push_back(static_cast<std::uint8_t>(value >> 24));
  output.push_back(static_cast<std::uint8_t>(value >> 16));
  output.push_back(static_cast<std::uint8_t>(value >> 8));
  output.push_back(static_cast<std::uint8_t>(value));
}

std::uint32_t crc32(const std::uint8_t* data, std::size_t size) {
  std::uint32_t crc = 0xFFFFFFFFU;

  for (std::size_t index = 0; index < size; ++index) {
    crc ^= data[index];

    for (int bit = 0; bit < 8; ++bit) {
      crc = (crc >> 1) ^ (0xEDB88320U & (0U - (crc & 1U)));
    }
  }

  return crc ^ 0xFFFFFFFFU;
}

std::uint32_t adler32(const std::vector<std::uint8_t>& data) {
  constexpr std::uint32_t modulus = 65521;
  std::uint32_t first = 1;
  std::uint32_t second = 0;

  for (const std::uint8_t value : data) {
    first = (first + value) % modulus;
    second = (second + first) % modulus;
  }

  return (second << 16) | first;
}

void appendChunk(
    std::vector<std::uint8_t>& png,
    std::string_view type,
    const std::vector<std::uint8_t>& data) {
  appendUint32(png, static_cast<std::uint32_t>(data.size()));

  const std::size_t crcStart = png.size();
  png.insert(png.end(), type.begin(), type.end());
  png.insert(png.end(), data.begin(), data.end());

  appendUint32(png, crc32(png.data() + crcStart, type.size() + data.size()));
}

std::vector<std::uint8_t> makeZlibStream(
    const std::vector<std::uint8_t>& rawData) {
  std::vector<std::uint8_t> output;
  output.reserve(rawData.size() + rawData.size() / 65535 * 5 + 16);

  output.push_back(0x78);
  output.push_back(0x01);

  std::size_t offset = 0;

  do {
    const std::size_t remaining = rawData.size() - offset;
    const auto blockSize = static_cast<std::uint16_t>(
        std::min<std::size_t>(remaining, 65535));
    const bool finalBlock = offset + blockSize == rawData.size();

    output.push_back(finalBlock ? 0x01 : 0x00);
    output.push_back(static_cast<std::uint8_t>(blockSize));
    output.push_back(static_cast<std::uint8_t>(blockSize >> 8));

    const std::uint16_t inverse = static_cast<std::uint16_t>(~blockSize);
    output.push_back(static_cast<std::uint8_t>(inverse));
    output.push_back(static_cast<std::uint8_t>(inverse >> 8));

    output.insert(
        output.end(), rawData.begin() + static_cast<std::ptrdiff_t>(offset),
        rawData.begin() + static_cast<std::ptrdiff_t>(offset + blockSize));
    offset += blockSize;
  } while (offset < rawData.size());

  appendUint32(output, adler32(rawData));
  return output;
}

}  // namespace

std::vector<std::uint8_t> encodeMonochromePng(
    const BitMatrix& modules,
    int outputWidth,
    int outputHeight,
    int horizontalMargin,
    int verticalMargin) {
  if (outputWidth <= 0 || outputHeight <= 0 || horizontalMargin < 0 ||
      verticalMargin < 0) {
    throw std::invalid_argument("Invalid PNG dimensions or margin");
  }

  const int sourceWidth = modules.width() + horizontalMargin * 2;
  const int sourceHeight = modules.height() + verticalMargin * 2;

  std::vector<std::uint8_t> pixels;
  pixels.reserve(static_cast<std::size_t>(outputHeight) * (outputWidth + 1));

  for (int y = 0; y < outputHeight; ++y) {
    pixels.push_back(0);

    const int sourceY = y * sourceHeight / outputHeight - verticalMargin;

    for (int x = 0; x < outputWidth; ++x) {
      const int sourceX = x * sourceWidth / outputWidth - horizontalMargin;
      const bool isDark = sourceX >= 0 && sourceY >= 0 &&
          sourceX < modules.width() && sourceY < modules.height() &&
          modules.get(sourceX, sourceY);

      pixels.push_back(isDark ? 0 : 255);
    }
  }

  std::vector<std::uint8_t> png = {
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

  std::vector<std::uint8_t> header;
  header.reserve(13);
  appendUint32(header, static_cast<std::uint32_t>(outputWidth));
  appendUint32(header, static_cast<std::uint32_t>(outputHeight));
  header.insert(header.end(), {8, 0, 0, 0, 0});

  appendChunk(png, "IHDR", header);
  appendChunk(png, "IDAT", makeZlibStream(pixels));
  appendChunk(png, "IEND", {});

  return png;
}

}  // namespace mnbg
