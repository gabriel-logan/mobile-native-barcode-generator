#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace mnbg {

std::string savePngToGallery(
    const std::vector<std::uint8_t>& png,
    const std::string& fileName);

}  // namespace mnbg
