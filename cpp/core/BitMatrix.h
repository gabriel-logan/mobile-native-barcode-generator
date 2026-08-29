#pragma once

#include <cstdint>
#include <vector>

namespace mnbg {

class BitMatrix {
 public:
  BitMatrix(int width, int height);

  int width() const noexcept;
  int height() const noexcept;

  bool get(int x, int y) const;
  void set(int x, int y, bool value = true);

 private:
  int width_;
  int height_;
  std::vector<std::uint8_t> values_;
};

}  // namespace mnbg
