#include "QrCodeEncoder.h"

#include <algorithm>
#include <array>
#include <cstdint>
#include <cstdlib>
#include <limits>
#include <stdexcept>
#include <utility>
#include <vector>

namespace mnbg {
namespace {

constexpr std::array<int, 41> eccCodewordsPerBlock = {
    -1, 7,  10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26,
    30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30};

constexpr std::array<int, 41> errorCorrectionBlocks = {
    -1, 1,  1,  1,  1,  1,  2,  2,  2,  2,  4,  4,  4,  4,
    4,  6,  6,  6,  7,  8,  8,  9,  9,  10, 12, 12, 12, 13,
    14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25, 25};

constexpr int finderPenalty = 40;

void appendBits(std::vector<bool>& output, std::uint32_t value, int bitCount) {
  if (bitCount < 0 || bitCount > 31 ||
      (bitCount < 31 && value >> bitCount != 0)) {
    throw std::invalid_argument("Bit value does not fit requested length");
  }

  for (int bit = bitCount - 1; bit >= 0; --bit) {
    output.push_back(((value >> bit) & 1U) != 0);
  }
}

int rawDataModules(int version) {
  int result = (16 * version + 128) * version + 64;

  if (version >= 2) {
    const int alignmentCount = version / 7 + 2;
    result -= (25 * alignmentCount - 10) * alignmentCount - 55;

    if (version >= 7) {
      result -= 36;
    }
  }

  return result;
}

int dataCodewords(int version) {
  return rawDataModules(version) / 8 -
      eccCodewordsPerBlock[static_cast<std::size_t>(version)] *
      errorCorrectionBlocks[static_cast<std::size_t>(version)];
}

int chooseVersion(std::size_t byteCount) {
  for (int version = 1; version <= 40; ++version) {
    const int countBits = version <= 9 ? 8 : 16;

    if (byteCount >= (std::size_t{1} << countBits)) {
      continue;
    }

    const std::size_t requiredBits = 4 + countBits + byteCount * 8;
    const std::size_t capacity =
        static_cast<std::size_t>(dataCodewords(version)) * 8;

    if (requiredBits <= capacity) {
      return version;
    }
  }

  throw std::length_error("QR code data is too long");
}

std::uint8_t reedSolomonMultiply(std::uint8_t left, std::uint8_t right) {
  std::uint8_t result = 0;

  for (int bit = 7; bit >= 0; --bit) {
    result = static_cast<std::uint8_t>((result << 1) ^ ((result >> 7) * 0x1D));
    result ^= static_cast<std::uint8_t>(((right >> bit) & 1U) * left);
  }

  return result;
}

std::vector<std::uint8_t> makeReedSolomonDivisor(int degree) {
  std::vector<std::uint8_t> result(static_cast<std::size_t>(degree));
  result.back() = 1;
  std::uint8_t root = 1;

  for (int index = 0; index < degree; ++index) {
    for (int coefficient = 0; coefficient < degree; ++coefficient) {
      result[static_cast<std::size_t>(coefficient)] = reedSolomonMultiply(
          result[static_cast<std::size_t>(coefficient)], root);

      if (coefficient + 1 < degree) {
        result[static_cast<std::size_t>(coefficient)] ^=
            result[static_cast<std::size_t>(coefficient + 1)];
      }
    }

    root = reedSolomonMultiply(root, 0x02);
  }

  return result;
}

std::vector<std::uint8_t> makeReedSolomonRemainder(
    const std::vector<std::uint8_t>& data,
    const std::vector<std::uint8_t>& divisor) {
  std::vector<std::uint8_t> result(divisor.size());

  for (const std::uint8_t value : data) {
    const std::uint8_t factor = value ^ result.front();
    std::move(result.begin() + 1, result.end(), result.begin());
    result.back() = 0;

    for (std::size_t index = 0; index < result.size(); ++index) {
      result[index] ^= reedSolomonMultiply(divisor[index], factor);
    }
  }

  return result;
}

std::vector<std::uint8_t> addErrorCorrection(
    const std::vector<std::uint8_t>& data,
    int version) {
  const int blockCount =
      errorCorrectionBlocks[static_cast<std::size_t>(version)];
  const int eccLength = eccCodewordsPerBlock[static_cast<std::size_t>(version)];
  const int rawCodewordCount = rawDataModules(version) / 8;
  const int shortBlockCount = blockCount - rawCodewordCount % blockCount;
  const int shortBlockLength = rawCodewordCount / blockCount;
  const int shortDataLength = shortBlockLength - eccLength;
  const std::vector<std::uint8_t> divisor = makeReedSolomonDivisor(eccLength);

  std::vector<std::vector<std::uint8_t>> dataBlocks;
  std::vector<std::vector<std::uint8_t>> eccBlocks;
  dataBlocks.reserve(static_cast<std::size_t>(blockCount));
  eccBlocks.reserve(static_cast<std::size_t>(blockCount));

  std::size_t offset = 0;

  for (int block = 0; block < blockCount; ++block) {
    const int blockDataLength =
        shortDataLength + (block < shortBlockCount ? 0 : 1);
    const auto blockEnd = offset + static_cast<std::size_t>(blockDataLength);

    dataBlocks.emplace_back(
        data.begin() + static_cast<std::ptrdiff_t>(offset),
        data.begin() + static_cast<std::ptrdiff_t>(blockEnd));
    eccBlocks.push_back(makeReedSolomonRemainder(dataBlocks.back(), divisor));
    offset = blockEnd;
  }

  std::vector<std::uint8_t> result;
  result.reserve(static_cast<std::size_t>(rawCodewordCount));

  for (int index = 0; index <= shortDataLength; ++index) {
    for (const auto& block : dataBlocks) {
      if (index < static_cast<int>(block.size())) {
        result.push_back(block[static_cast<std::size_t>(index)]);
      }
    }
  }

  for (int index = 0; index < eccLength; ++index) {
    for (const auto& block : eccBlocks) {
      result.push_back(block[static_cast<std::size_t>(index)]);
    }
  }

  if (result.size() != static_cast<std::size_t>(rawCodewordCount)) {
    throw std::logic_error("QR code block interleaving failed");
  }

  return result;
}

std::vector<std::uint8_t> makeDataCodewords(
    const std::string& value,
    int version) {
  std::vector<bool> bits;
  bits.reserve(value.size() * 8 + 24);

  appendBits(bits, 0x4, 4);
  appendBits(
      bits, static_cast<std::uint32_t>(value.size()), version <= 9 ? 8 : 16);

  for (const unsigned char byte : value) {
    appendBits(bits, byte, 8);
  }

  const std::size_t capacity =
      static_cast<std::size_t>(dataCodewords(version)) * 8;
  const std::size_t terminator =
      std::min<std::size_t>(4, capacity - bits.size());
  bits.insert(bits.end(), terminator, false);

  while (bits.size() % 8 != 0) {
    bits.push_back(false);
  }

  std::vector<std::uint8_t> result;
  result.reserve(capacity / 8);

  for (std::size_t offset = 0; offset < bits.size(); offset += 8) {
    std::uint8_t valueByte = 0;

    for (int bit = 0; bit < 8; ++bit) {
      valueByte = static_cast<std::uint8_t>(
          (valueByte << 1) |
          (bits[offset + static_cast<std::size_t>(bit)] ? 1 : 0));
    }

    result.push_back(valueByte);
  }

  for (std::uint8_t pad = 0xEC; result.size() < capacity / 8;
       pad ^= 0xEC ^ 0x11) {
    result.push_back(pad);
  }

  return result;
}

class QrMatrixBuilder {
 public:
  QrMatrixBuilder(int version, const std::vector<std::uint8_t>& codewords)
      : version_(version),
        size_(version * 4 + 17),
        modules_(size_, size_),
        functionModules_(size_, size_) {
    drawFunctionPatterns();
    drawCodewords(codewords);

    int bestMask = 0;
    int bestPenalty = std::numeric_limits<int>::max();

    for (int mask = 0; mask < 8; ++mask) {
      applyMask(mask);
      drawFormatBits(mask);
      const int currentPenalty = penaltyScore();

      if (currentPenalty < bestPenalty) {
        bestPenalty = currentPenalty;
        bestMask = mask;
      }

      applyMask(mask);
    }

    applyMask(bestMask);
    drawFormatBits(bestMask);
  }

  BitMatrix takeMatrix() {
    return std::move(modules_);
  }

 private:
  void setFunctionModule(int x, int y, bool dark) {
    modules_.set(x, y, dark);
    functionModules_.set(x, y);
  }

  void drawFinderPattern(int centerX, int centerY) {
    for (int offsetY = -4; offsetY <= 4; ++offsetY) {
      for (int offsetX = -4; offsetX <= 4; ++offsetX) {
        const int x = centerX + offsetX;
        const int y = centerY + offsetY;

        if (x < 0 || y < 0 || x >= size_ || y >= size_) {
          continue;
        }

        const int distance = std::max(std::abs(offsetX), std::abs(offsetY));
        setFunctionModule(x, y, distance != 2 && distance != 4);
      }
    }
  }

  void drawAlignmentPattern(int centerX, int centerY) {
    for (int offsetY = -2; offsetY <= 2; ++offsetY) {
      for (int offsetX = -2; offsetX <= 2; ++offsetX) {
        const int distance = std::max(std::abs(offsetX), std::abs(offsetY));
        setFunctionModule(centerX + offsetX, centerY + offsetY, distance != 1);
      }
    }
  }

  std::vector<int> alignmentPatternPositions() const {
    if (version_ == 1) {
      return {};
    }

    const int count = version_ / 7 + 2;
    const int step = version_ == 32
        ? 26
        : ((version_ * 4 + count * 2 + 1) / (count * 2 - 2)) * 2;
    std::vector<int> result(static_cast<std::size_t>(count));
    result.front() = 6;

    for (int index = count - 1, position = size_ - 7; index >= 1;
         --index, position -= step) {
      result[static_cast<std::size_t>(index)] = position;
    }

    return result;
  }

  void drawVersion() {
    if (version_ < 7) {
      return;
    }

    int remainder = version_;

    for (int index = 0; index < 12; ++index) {
      remainder = (remainder << 1) ^ ((remainder >> 11) * 0x1F25);
    }

    const int bits = version_ << 12 | remainder;

    for (int index = 0; index < 18; ++index) {
      const bool dark = ((bits >> index) & 1) != 0;
      const int first = size_ - 11 + index % 3;
      const int second = index / 3;
      setFunctionModule(first, second, dark);
      setFunctionModule(second, first, dark);
    }
  }

  void drawFormatBits(int mask) {
    constexpr int errorCorrectionFormatBits = 1;
    const int data = errorCorrectionFormatBits << 3 | mask;
    int remainder = data;

    for (int index = 0; index < 10; ++index) {
      remainder = (remainder << 1) ^ ((remainder >> 9) * 0x537);
    }

    const int bits = (data << 10 | remainder) ^ 0x5412;
    const auto bit = [bits](int index) { return ((bits >> index) & 1) != 0; };

    for (int index = 0; index <= 5; ++index) {
      setFunctionModule(8, index, bit(index));
    }

    setFunctionModule(8, 7, bit(6));
    setFunctionModule(8, 8, bit(7));
    setFunctionModule(7, 8, bit(8));

    for (int index = 9; index < 15; ++index) {
      setFunctionModule(14 - index, 8, bit(index));
    }

    for (int index = 0; index < 8; ++index) {
      setFunctionModule(size_ - 1 - index, 8, bit(index));
    }

    for (int index = 8; index < 15; ++index) {
      setFunctionModule(8, size_ - 15 + index, bit(index));
    }

    setFunctionModule(8, size_ - 8, true);
  }

  void drawFunctionPatterns() {
    for (int index = 0; index < size_; ++index) {
      setFunctionModule(6, index, index % 2 == 0);
      setFunctionModule(index, 6, index % 2 == 0);
    }

    drawFinderPattern(3, 3);
    drawFinderPattern(size_ - 4, 3);
    drawFinderPattern(3, size_ - 4);

    const std::vector<int> positions = alignmentPatternPositions();

    for (std::size_t y = 0; y < positions.size(); ++y) {
      for (std::size_t x = 0; x < positions.size(); ++x) {
        const bool overlapsFinder = (x == 0 && y == 0) ||
            (x == 0 && y == positions.size() - 1) ||
            (x == positions.size() - 1 && y == 0);

        if (!overlapsFinder) {
          drawAlignmentPattern(positions[x], positions[y]);
        }
      }
    }

    drawFormatBits(0);
    drawVersion();
  }

  void drawCodewords(const std::vector<std::uint8_t>& codewords) {
    std::size_t bitIndex = 0;

    for (int right = size_ - 1; right >= 1; right -= 2) {
      if (right == 6) {
        right = 5;
      }

      for (int vertical = 0; vertical < size_; ++vertical) {
        const int y = ((right + 1) & 2) == 0 ? size_ - 1 - vertical : vertical;

        for (int column = 0; column < 2; ++column) {
          const int x = right - column;

          if (functionModules_.get(x, y) || bitIndex >= codewords.size() * 8) {
            continue;
          }

          const bool dark =
              ((codewords[bitIndex >> 3] >> (7 - (bitIndex & 7))) & 1U) != 0;
          modules_.set(x, y, dark);
          ++bitIndex;
        }
      }
    }
  }

  static bool maskValue(int mask, int x, int y) {
    switch (mask) {
      case 0:
        return (x + y) % 2 == 0;
      case 1:
        return y % 2 == 0;
      case 2:
        return x % 3 == 0;
      case 3:
        return (x + y) % 3 == 0;
      case 4:
        return (x / 3 + y / 2) % 2 == 0;
      case 5:
        return x * y % 2 + x * y % 3 == 0;
      case 6:
        return (x * y % 2 + x * y % 3) % 2 == 0;
      case 7:
        return ((x + y) % 2 + x * y % 3) % 2 == 0;
      default:
        throw std::invalid_argument("Invalid QR code mask");
    }
  }

  void applyMask(int mask) {
    for (int y = 0; y < size_; ++y) {
      for (int x = 0; x < size_; ++x) {
        if (!functionModules_.get(x, y) && maskValue(mask, x, y)) {
          modules_.set(x, y, !modules_.get(x, y));
        }
      }
    }
  }

  int linePenalty(bool horizontal, int fixed) const {
    int result = 0;
    int runLength = 0;
    bool previous = false;
    int window = 0;

    for (int index = 0; index < size_; ++index) {
      const bool dark =
          horizontal ? modules_.get(index, fixed) : modules_.get(fixed, index);

      if (index == 0 || dark != previous) {
        if (runLength >= 5) {
          result += runLength - 2;
        }

        previous = dark;
        runLength = 1;
      } else {
        ++runLength;
      }

      window = ((window << 1) | (dark ? 1 : 0)) & 0x7FF;

      if (index >= 10 && (window == 0x05D || window == 0x5D0)) {
        result += finderPenalty;
      }
    }

    if (runLength >= 5) {
      result += runLength - 2;
    }

    return result;
  }

  int penaltyScore() const {
    int result = 0;
    int darkModules = 0;

    for (int index = 0; index < size_; ++index) {
      result += linePenalty(true, index);
      result += linePenalty(false, index);
    }

    for (int y = 0; y < size_; ++y) {
      for (int x = 0; x < size_; ++x) {
        darkModules += modules_.get(x, y) ? 1 : 0;

        if (x + 1 < size_ && y + 1 < size_) {
          const bool value = modules_.get(x, y);

          if (modules_.get(x + 1, y) == value &&
              modules_.get(x, y + 1) == value &&
              modules_.get(x + 1, y + 1) == value) {
            result += 3;
          }
        }
      }
    }

    const int totalModules = size_ * size_;
    const int balance =
        std::abs(darkModules * 20 - totalModules * 10) / totalModules;
    result += balance * 10;
    return result;
  }

  int version_;
  int size_;
  BitMatrix modules_;
  BitMatrix functionModules_;
};

}  // namespace

BitMatrix encodeQrCode(const std::string& value) {
  if (value.empty()) {
    throw std::invalid_argument("QR code value cannot be empty");
  }

  const int version = chooseVersion(value.size());
  const std::vector<std::uint8_t> data = makeDataCodewords(value, version);
  const std::vector<std::uint8_t> codewords = addErrorCorrection(data, version);

  return QrMatrixBuilder(version, codewords).takeMatrix();
}

}  // namespace mnbg
