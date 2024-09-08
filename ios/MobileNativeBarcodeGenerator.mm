#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MobileNativeBarcodeGenerator, NSObject)

RCT_EXTERN_METHOD(generateBarcode:(NSString *)value width:(NSInteger)width height:(NSInteger)height
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(generateQRCode:(NSString *)value width:(NSInteger)width height:(NSInteger)height
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
