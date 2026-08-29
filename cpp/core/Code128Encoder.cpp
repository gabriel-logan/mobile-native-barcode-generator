#include "Code128Encoder.h"

#include <algorithm>
#include <array>
#include <cctype>
#include <stdexcept>
#include <string_view>
#include <vector>

namespace mnbg {
namespace {

constexpr std::array<std::string_view, 107> patterns = {
    "212222",  "222122", "222221", "121223", "121322", "131222",
    "122213",  "122312", "132212", "221213", "221312", "231212",
    "112232",  "122132", "122231", "113222", "123122", "123221",
    "223211",  "221132", "221231", "213212", "223112", "312131",
    "311222",  "321122", "321221", "312212", "322112", "322211",
    "212123",  "212321", "232121", "111323", "131123", "131321",
    "112313",  "132113", "132311", "211313", "231113", "231311",
    "112133",  "112331", "132131", "113123", "113321", "133121",
    "313121",  "211331", "231131", "213113", "213311", "213131",
    "311123",  "311321", "331121", "312113", "312311", "332111",
    "314111",  "221411", "431111", "111224", "111422", "121124",
    "121421",  "141122", "141221", "112214", "112412", "122114",
    "122411",  "142112", "142211", "241211", "221114", "413111",
    "241112",  "134111", "111242", "121142", "121241", "114212",
    "124112",  "124211", "411212", "421112", "421211", "212141",
    "214121",  "412121", "111143", "111341", "131141", "114113",
    "114311",  "411113", "411311", "113141", "114131", "311141",
    "411131",  "211412", "211214", "211232", "2331112"};

enum class CodeSet {
  none,
  a,
  b,
  c,
};

std::size_t countDigits(const std::string& value, std::size_t offset) {
  std::size_t result = 0;

  while (offset + result < value.size() &&
         std::isdigit(static_cast<unsigned char>(value[offset + result])) != 0) {
    ++result;
  }

  return result;
}

CodeSet chooseTextSet(unsigned char value) {
  return value < 32 ? CodeSet::a : CodeSet::b;
}

int startCode(CodeSet set) {
  switch (set) {
    case CodeSet::a:
      return 103;
    case CodeSet::b:
      return 104;
    case CodeSet::c:
      return 105;
    case CodeSet::none:
      break;
  }

  throw std::logic_error("Code 128 start set was not selected");
}

int switchCode(CodeSet set) {
  switch (set) {
    case CodeSet::a:
      return 101;
    case CodeSet::b:
      return 100;
    case CodeSet::c:
      return 99;
    case CodeSet::none:
      break;
  }

  throw std::logic_error("Code 128 switch set was not selected");
}

std::vector<int> makeCodewords(const std::string& value) {
  if (value.empty()) {
    throw std::invalid_argument("Barcode value cannot be empty");
  }

  for (const unsigned char character : value) {
    if (character > 127) {
      throw std::invalid_argument(
          "CODE_128 supports ASCII characters only");
    }
  }

  const std::size_t firstDigitRun = countDigits(value, 0);
  CodeSet set = firstDigitRun >= 4 || firstDigitRun == value.size()
      ? CodeSet::c
      : chooseTextSet(static_cast<unsigned char>(value.front()));

  std::vector<int> codewords = {startCode(set)};
  std::size_t offset = 0;

  while (offset < value.size()) {
    const std::size_t digitRun = countDigits(value, offset);

    if (set != CodeSet::c && digitRun >= 4) {
      codewords.push_back(switchCode(CodeSet::c));
      set = CodeSet::c;
      continue;
    }

    if (set == CodeSet::c) {
      if (digitRun >= 2) {
        codewords.push_back(
            (value[offset] - '0') * 10 + (value[offset + 1] - '0'));
        offset += 2;
        continue;
      }

      set = chooseTextSet(static_cast<unsigned char>(value[offset]));
      codewords.push_back(switchCode(set));
      continue;
    }

    const unsigned char character =
        static_cast<unsigned char>(value[offset]);
    const CodeSet requiredSet = chooseTextSet(character);

    if (requiredSet != set) {
      set = requiredSet;
      codewords.push_back(switchCode(set));
      continue;
    }

    codewords.push_back(set == CodeSet::a
                            ? (character < 32 ? character + 64 : character - 32)
                            : character - 32);
    ++offset;
  }

  int checksum = codewords.front();

  for (std::size_t index = 1; index < codewords.size(); ++index) {
    checksum += codewords[index] * static_cast<int>(index);
  }

  codewords.push_back(checksum % 103);
  codewords.push_back(106);
  return codewords;
}

}  // namespace

BitMatrix encodeCode128(const std::string& value) {
  const std::vector<int> codewords = makeCodewords(value);
  int width = 0;

  for (const int codeword : codewords) {
    for (const char elementWidth : patterns[static_cast<std::size_t>(codeword)]) {
      width += elementWidth - '0';
    }
  }

  BitMatrix result(width, 1);
  int x = 0;

  for (const int codeword : codewords) {
    bool dark = true;

    for (const char elementWidth : patterns[static_cast<std::size_t>(codeword)]) {
      const int runLength = elementWidth - '0';

      if (dark) {
        for (int index = 0; index < runLength; ++index) {
          result.set(x + index, 0);
        }
      }

      x += runLength;
      dark = !dark;
    }
  }

  return result;
}

}  // namespace mnbg
