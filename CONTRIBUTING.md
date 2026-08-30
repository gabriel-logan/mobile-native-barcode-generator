# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Repository layout

- `cpp/` — the shared C++ core: encoders (`Code128Encoder`, `QrCodeEncoder`), `BitMatrix`, `PngEncoder`, `Base64`, the Turbo Module (`NativeMobileNativeBarcodeGenerator`), the per-platform gallery savers in `cpp/platform/` and the Emscripten bindings in `cpp/wasm/`.
- `wasm/` — the Emscripten build of the core and its TypeScript declaration, both produced by `pnpm build:wasm`. Fully generated, so the whole directory is ignored by git.
- `src/` — the TypeScript API: the codegen spec, input validation and the `BarcodeView` / `QRCodeView` components. Files ending in `.web.ts` are the browser implementations that bundlers pick over their native siblings.
- `android/` and `ios/` — thin platform glue only (Gradle/CMake wiring, the iOS module provider and `GallerySaver.mm`).
- `tests/cpp/` — standalone tests for the C++ core, run with CTest.
- `example/` — a React Native app that exercises every public API.

Generation logic belongs in `cpp/core/`. Please do not reintroduce Kotlin or Swift encoders, and do not add a JavaScript encoder for the web: all three platforms must keep producing byte-identical images from the same C++ code.

## Development workflow

The project uses [pnpm](https://pnpm.io/). Install the dependencies from the root directory:

```sh
pnpm install
```

Node 22 or newer is required (see `.nvmrc`). Building the C++ core also needs CMake 3.13+ and a C++20 compiler.

### Rebuilding the WebAssembly artifact

The web module runs the same C++ core compiled to wasm. Everything in `wasm/` is generated and ignored by git, so **build it once after cloning, and again whenever you change anything under `cpp/core/` or `cpp/wasm/`**:

```sh
pnpm build:wasm
```

`pnpm test` and `prepack` run it for you; `pnpm test:ts` on its own expects it to be there already.

The script uses `emcmake` from a local [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) when one is on the PATH and otherwise falls back to the `emscripten/emsdk` Docker image, so publishing a release needs one of the two available. The version is pinned in `scripts/build-wasm.js` so every machine produces the same artifact.

The artifact is a single self-contained CommonJS file with the wasm binary embedded, so consumers never have to serve a `.wasm` asset; `--emit-tsd` writes `mnbg-wasm.d.ts` beside it from the embind bindings. Failures are returned to JavaScript as `{ error }` rather than thrown, because an unwound C++ exception only reaches the browser as an opaque pointer and would lose the message the native modules reject with.

Build the JavaScript output and the codegen spec:

```sh
pnpm build
```

The [example app](/example/) demonstrates usage of the library and depends on it through `file:..`, so run `pnpm build` in the root before installing or rebuilding the example. It has its own lockfile and is installed separately:

```sh
cd example
npm install
npm start        # start Metro
npm run android  # run on Android
npm run ios      # run on iOS (run `bundle exec pod install` in example/ios first)
npm run web      # run in the browser on http://localhost:3000
```

If you want to use Android Studio or Xcode to edit the native code, open `example/android` or `example/ios` respectively. The C++ sources show up under the `mobile-native-barcode-generator` module.

## Checks

Type-check the library:

```sh
pnpm typecheck
```

Run the TypeScript unit tests with Vitest:

```sh
pnpm test:ts
```

Build and run the C++ core tests:

```sh
pnpm test:cpp
```

Run the portable suites (TypeScript and C++ tests plus type checking):

```sh
pnpm test
```

The platform glue has dedicated commands. Android's dependency-free Java
harness needs JDK 17; Objective-C++ tests run only on macOS:

```sh
pnpm test:android
pnpm test:ios
```

None of these commands runs anything under `example/`.

### Linting and formatting

Each language uses its own tooling. None of it covers `example/`, which is checked separately.

```sh
# TypeScript
pnpm format   # pnpm format:check to verify
pnpm lint     # pnpm lint:fix to autofix

# C++ and Objective-C++, styled by .clang-format, checked by .clang-tidy
clang-format -i $(git ls-files 'cpp/*' 'ios/*' 'tests/cpp/*')
clang-tidy cpp/core/*.cpp tests/cpp/core_test.cpp -- -std=c++20 -Icpp

# Android, needs Gradle and a JDK 17
gradle spotlessApply   # gradle spotlessCheck to verify
```

clang-tidy only covers the portable core: the remaining sources need generated codegen headers or the NDK, which it cannot resolve.

The example app has its own linting and Jest suite, including a contract test that pins the public API:

```sh
cd example
npm run lint
npm test
```

Remember to add tests for your change if possible: C++ changes belong in
`tests/cpp/core_test.cpp`, TypeScript behavior in `tests/typescript/`, Android
Java behavior in `android/src/test/java/`, and Objective-C++ behavior in
`tests/ios/`.

## Continuous integration

Every pull request against `main` runs one workflow per language, each scoped by path so only the affected checks run:

| Workflow            | File                                     | What it does                                                                                                                        |
| ------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| PR Check C++        | `.github/workflows/pr-check-cpp.yml`     | Builds the core on Linux and macOS in Debug and Release, runs CTest, and rebuilds with `-Werror` after clang-format and clang-tidy. |
| PR Check TypeScript | `.github/workflows/pr-check-ts.yml`      | `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm build`, `pnpm pack` and a codegen run.                                    |
| PR Check Android    | `.github/workflows/pr-check-android.yml` | Runs Spotless, validates the Gradle wrapper and assembles the example app (arm64 only), which compiles the C++ through the NDK.     |
| PR Check iOS        | `.github/workflows/pr-check-ios.yml`     | Runs `pod install` and builds the example app for the iOS simulator.                                                                |
| PR Check Example    | `.github/workflows/pr-check-example.yml` | Lints, type-checks and runs the example Jest suite, including the public API contract test.                                         |
| PR Check Web        | `.github/workflows/pr-check-web.yml`     | Builds the wasm artifact from the C++ core, runs the TypeScript suite against it and bundles the example for the web.               |

All of them also run on pushes to `main` and can be started manually from the Actions tab.

## Regenerating the codegen artifacts

After changing `src/specs/NativeMobileNativeBarcodeGenerator.ts`, regenerate the native interfaces:

```sh
pnpm codegen
```

The generated files (`android/generated/`, `ios/generated/`) are ignored by git and rebuilt by the app build.

## Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

## Code style

Two spaces for indentation, LF line endings, UTF-8 and a final newline, in every language. The formatters above own the layout, so run them instead of aligning code by hand. Match the surrounding code: single quotes and trailing commas in TypeScript, `#pragma once` headers and the `mnbg` namespace in C++.

## Publishing to npm

`prepack` runs `pnpm build`, so publishing builds the package first:

```sh
npm version <patch|minor|major>
npm publish
```

Only the files listed under `files` in `package.json` are published — the C++ sources, the compiled `dist/`, the wasm artifact, the type definitions and the platform glue. `scripts/` is not published: it only serves contributors regenerating artifacts.

`prepack` builds the wasm artifact too, so the publishing machine needs Emscripten or Docker. Check that `wasm/mnbg-wasm.js` is in the tarball before pushing a release.

## Scripts

The `package.json` file contains various scripts for common tasks:

- `pnpm install`: setup project by installing dependencies.
- `pnpm build`: compile TypeScript to `dist/` and copy the codegen spec.
- `pnpm build:cpp`: configure and build the C++ core (with tests).
- `pnpm build:wasm`: build `wasm/mnbg-wasm.js` from the C++ core; needs Emscripten or Docker.
- `pnpm typecheck`: type-check files with TypeScript.
- `pnpm test:cpp`: build and run the C++ core tests with CTest.
- `pnpm test`: run the TypeScript and C++ tests plus the type check.
- `pnpm test:ts`: run the TypeScript unit tests with Vitest.
- `pnpm test:android`: run the dependency-free Java unit-test harness.
- `pnpm test:ios`: run the Objective-C++ unit tests on macOS.
- `pnpm codegen`: regenerate the React Native codegen artifacts.

## Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that the checks above are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
