#include "GallerySaverUtils.h"

#include <algorithm>
#include <string>

namespace mnbg {

std::string normalizeGalleryFileName(std::string fileName) {
  std::replace(fileName.begin(), fileName.end(), '/', '_');
  std::replace(fileName.begin(), fileName.end(), '\\', '_');

  if (fileName.size() < 4 || fileName.substr(fileName.size() - 4) != ".png") {
    fileName += ".png";
  }

  return fileName;
}

}  // namespace mnbg
