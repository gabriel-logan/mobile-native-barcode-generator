#pragma once

#include <cstdint>
#include <filesystem>
#include <string>
#include <vector>

namespace mnbg {

// Shared by the Windows gallery adapter and filesystem integration tests.
std::string savePngToDirectory(
    const std::vector<std::uint8_t>& png,
    const std::string& fileName,
    const std::filesystem::path& directory);

}  // namespace mnbg
