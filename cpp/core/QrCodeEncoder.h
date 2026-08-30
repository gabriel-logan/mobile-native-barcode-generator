#pragma once

#include "BitMatrix.h"

#include <string>

namespace mnbg {

BitMatrix encodeQrCode(const std::string& value);

}  // namespace mnbg
