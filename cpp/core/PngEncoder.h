#pragma once

#include "BitMatrix.h"

#include <cstdint>
#include <vector>

namespace mnbg {

std::vector<std::uint8_t> encodeMonochromePng(
    const BitMatrix& modules,
    int outputWidth,
    int outputHeight,
    int horizontalMargin,
    int verticalMargin);

}  // namespace mnbg
