module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: "./android",
        cxxModuleCMakeListsModuleName: "mobile_native_barcode_generator",
        cxxModuleCMakeListsPath: "../CMakeLists.txt",
        cxxModuleHeaderName: "NativeMobileNativeBarcodeGenerator",
      },
      ios: {},
      windows: {
        sourceDir: "windows",
        projects: [
          {
            projectFile:
              "MobileNativeBarcodeGenerator/MobileNativeBarcodeGenerator.vcxproj",
            directDependency: true,
          },
        ],
      },
    },
  },
};
