# Example App

This React Native application demonstrates barcode and QR code rendering,
generation, and image saving with `mobile-native-barcode-generator`.

The app supports Android, iOS, Windows, and Web.

## Requirements

Install the project dependencies from the `example` directory:

```sh
npm install
```

### Android

- Node.js 22.11 or newer
- Android Studio and Android SDK
- Java 17
- Android emulator or physical device

### iOS

- macOS
- Xcode
- CocoaPods
- iOS Simulator or physical device

Install the pods:

```sh
cd ios
pod install
cd ..
```

### Windows

- Windows 10 or Windows 11 with Developer Mode enabled
- Node.js 22 or newer
- .NET SDK 10
- PowerShell 7
- Visual Studio 2026 with **Desktop development with C++**
- MSBuild, MSVC x64/x86 tools, and Windows 11 SDK `10.0.22621.0`

Verify the Windows requirements with:

```powershell
.\node_modules\react-native-windows\scripts\rnw-dependencies.ps1
```

### Web

- A current browser with WebAssembly support

## Development

Run these commands from the `example` directory.

### Android

```sh
npm run android
```

### iOS

```sh
npm run ios
```

### Windows

```powershell
npm run windows
```

### Web

```sh
npm run web
```

The web app runs at `http://localhost:3000`.

Android, iOS, and Windows use Metro. To run Metro separately:

```sh
npm start
```

Then run the desired native platform command in another terminal.

## Production builds

### Android

Build a release APK:

```powershell
cd android
.\gradlew.bat assembleRelease
```

Output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Build an Android App Bundle:

```powershell
cd android
.\gradlew.bat bundleRelease
```

Output:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Configure a private signing key before publishing the Android app.

### iOS

Open the CocoaPods workspace on macOS:

```sh
open ios/example.xcworkspace
```

In Xcode, configure signing and select **Product > Archive**.

### Windows

Build the bundled Release configuration without deploying it:

```powershell
npm run windows -- --release --bundle --no-packager --no-deploy
```

To create a distributable package, open the solution:

```powershell
start windows\example.sln
```

Select `Release` and `x64` in Visual Studio, then publish the package project.

### Web

```sh
npm run build:web
```

The optimized static files are generated in `dist-web/`.

## Tests and linting

```sh
npm test
npm run test:windows
npm run lint
```
