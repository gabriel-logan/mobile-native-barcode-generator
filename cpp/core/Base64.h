#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace mnbg {

std::string encodeBase64(const std::vector<std::uint8_t>& data);

}  // namespace mnbg
