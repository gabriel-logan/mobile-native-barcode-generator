#pragma once

#include "BitMatrix.h"

#include <string>

namespace mnbg {

BitMatrix encodeCode128(const std::string& value);

}  // namespace mnbg
