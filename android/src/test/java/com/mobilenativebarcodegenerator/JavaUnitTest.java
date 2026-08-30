package com.mobilenativebarcodegenerator;

import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;

public final class JavaUnitTest {
  private JavaUnitTest() {}

  private static void require(boolean condition, String message) {
    if (!condition) {
      throw new AssertionError(message);
    }
  }

  private static void testGalleryContextRequiresInitialization() {
    boolean rejectedUninitializedAccess = false;

    try {
      GalleryContextProvider.getApplicationContext();
    } catch (IllegalStateException error) {
      rejectedUninitializedAccess =
          "Gallery context has not been initialized".equals(error.getMessage());
    }

    require(rejectedUninitializedAccess, "Gallery context was available before initialization");
  }

  private static void testGalleryContextInitializationAndProviderContract() {
    Context applicationContext = new Context();
    GalleryContextProvider provider = new GalleryContextProvider();
    provider.setContext(new Context(applicationContext));

    require(provider.onCreate(), "Gallery provider did not initialize");
    require(
        GalleryContextProvider.getApplicationContext() == applicationContext,
        "Gallery provider did not retain the application context");
    require(
        provider.query(new Uri(), null, null, null, null) == null,
        "Gallery provider unexpectedly returned query data");
    require(provider.getType(new Uri()) == null, "Gallery provider reported a MIME type");

    requireUnsupported(() -> provider.insert(new Uri(), new ContentValues()), "insert");
    requireUnsupported(() -> provider.delete(new Uri(), null, null), "delete");
    requireUnsupported(() -> provider.update(new Uri(), new ContentValues(), null, null), "update");
  }

  private static void requireUnsupported(Runnable operation, String operationName) {
    boolean rejected = false;

    try {
      operation.run();
    } catch (UnsupportedOperationException error) {
      rejected = true;
    }

    require(rejected, "Gallery provider accepted unsupported " + operationName);
  }

  private static void testPackageKeepsJavaRegistrationEmpty() {
    MobileNativeBarcodeGeneratorPackage barcodePackage = new MobileNativeBarcodeGeneratorPackage();

    require(
        barcodePackage.createNativeModules(null).isEmpty(),
        "Java package registered a native module instead of using the C++ TurboModule");
    require(
        barcodePackage.createViewManagers(null).isEmpty(),
        "Java package registered a view manager unexpectedly");
  }

  public static void main(String[] arguments) {
    testGalleryContextRequiresInitialization();
    testGalleryContextInitializationAndProviderContract();
    testPackageKeepsJavaRegistrationEmpty();
    System.out.println("All Java unit tests passed");
  }
}
