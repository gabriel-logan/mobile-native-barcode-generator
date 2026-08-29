#import "MobileNativeBarcodeGeneratorModuleProvider.h"

#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/TurboModule.h>

#import "NativeMobileNativeBarcodeGenerator.h"

@implementation MobileNativeBarcodeGeneratorModuleProvider

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams&)params
{
  return std::make_shared<
      facebook::react::NativeMobileNativeBarcodeGenerator>(params.jsInvoker);
}

@end
