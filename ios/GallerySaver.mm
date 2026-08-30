#import <Foundation/Foundation.h>
#import <Photos/Photos.h>

#include "../cpp/platform/GallerySaver.h"

#include <algorithm>
#include <stdexcept>
#include <string>
#include <vector>

namespace mnbg {
namespace {

bool canAddPhotos(PHAuthorizationStatus status) {
  return status == PHAuthorizationStatusAuthorized ||
      status == PHAuthorizationStatusLimited;
}

PHAuthorizationStatus requestPhotoAuthorization() {
  PHAuthorizationStatus status;

  if (@available(iOS 14, *)) {
    status = [PHPhotoLibrary authorizationStatusForAccessLevel:
                                 PHAccessLevelAddOnly];
  } else {
    status = [PHPhotoLibrary authorizationStatus];
  }

  if (status != PHAuthorizationStatusNotDetermined) {
    return status;
  }

  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
  __block PHAuthorizationStatus requestedStatus =
      PHAuthorizationStatusNotDetermined;

  if (@available(iOS 14, *)) {
    [PHPhotoLibrary requestAuthorizationForAccessLevel:PHAccessLevelAddOnly
                                               handler:^(PHAuthorizationStatus result) {
      requestedStatus = result;
      dispatch_semaphore_signal(semaphore);
    }];
  } else {
    [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus result) {
      requestedStatus = result;
      dispatch_semaphore_signal(semaphore);
    }];
  }

  dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
  return requestedStatus;
}

std::string normalizedFileName(std::string fileName) {
  std::replace(fileName.begin(), fileName.end(), '/', '_');
  std::replace(fileName.begin(), fileName.end(), '\\', '_');

  if (fileName.size() < 4 || fileName.substr(fileName.size() - 4) != ".png") {
    fileName += ".png";
  }

  return fileName;
}

}  // namespace

std::string savePngToGallery(
    const std::vector<std::uint8_t>& png,
    const std::string& requestedFileName) {
  @autoreleasepool {
    if (!canAddPhotos(requestPhotoAuthorization())) {
      throw std::runtime_error(
          "Permission to save images to the photo library was denied");
    }

    NSData* data = [NSData dataWithBytes:png.data() length:png.size()];
    NSString* fileName = [NSString
        stringWithUTF8String:normalizedFileName(requestedFileName).c_str()];
    __block NSString* localIdentifier = nil;
    NSError* error = nil;

    const BOOL saved = [[PHPhotoLibrary sharedPhotoLibrary]
        performChangesAndWait:^{
          PHAssetCreationRequest* request =
              [PHAssetCreationRequest creationRequestForAsset];
          PHAssetResourceCreationOptions* options =
              [[PHAssetResourceCreationOptions alloc] init];
          options.originalFilename = fileName;
          [request addResourceWithType:PHAssetResourceTypePhoto
                                  data:data
                               options:options];
          localIdentifier = request.placeholderForCreatedAsset.localIdentifier;
        }
        error:&error];

    if (!saved) {
      const char* message = error.localizedDescription.UTF8String;
      throw std::runtime_error(
          message == nullptr ? "Failed to save image to the photo library"
                             : message);
    }

    if (localIdentifier == nil) {
      return "Saved to gallery";
    }

    return "ph://" + std::string(localIdentifier.UTF8String);
  }
}

}  // namespace mnbg
