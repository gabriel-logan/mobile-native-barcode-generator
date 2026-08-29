#include "BitMatrix.h"

#include <stdexcept>

namespace mnbg {

BitMatrix::BitMatrix(int width, int height)
    : width_(width), height_(height), values_(width * height, 0) {
  if (width <= 0 || height <= 0) {
    throw std::invalid_argument("Matrix dimensions must be positive");
  }
}

int BitMatrix::width() const noexcept {
  return width_;
}

int BitMatrix::height() const noexcept {
  return height_;
}

bool BitMatrix::get(int x, int y) const {
  if (x < 0 || y < 0 || x >= width_ || y >= height_) {
    throw std::out_of_range("Matrix coordinate is out of range");
  }

  return values_[static_cast<std::size_t>(y * width_ + x)] != 0;
}

void BitMatrix::set(int x, int y, bool value) {
  if (x < 0 || y < 0 || x >= width_ || y >= height_) {
    throw std::out_of_range("Matrix coordinate is out of range");
  }

  values_[static_cast<std::size_t>(y * width_ + x)] = value ? 1 : 0;
}

}  // namespace mnbg
