package com.mobilenativebarcodegenerator;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Collections;
import java.util.List;

/**
 * Lets React Native autolinking discover the Android project. The actual
 * TurboModule implementation is registered and instantiated from C++.
 */
@SuppressWarnings({"deprecation", "rawtypes"})
public final class MobileNativeBarcodeGeneratorPackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext context) {
    return Collections.emptyList();
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext context) {
    return Collections.emptyList();
  }
}
