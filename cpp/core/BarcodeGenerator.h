#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace mnbg {

enum class Symbology {
  code128,
  qrCode,
};

std::vector<std::uint8_t> generatePng(
    Symbology symbology,
    const std::string& value,
    int width,
    int height);

std::string generatePngBase64(
    Symbology symbology,
    const std::string& value,
    int width,
    int height);

}  // namespace mnbg
