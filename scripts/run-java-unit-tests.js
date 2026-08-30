const { mkdirSync, readdirSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const outputDirectory = "build/java-tests";
const stubDirectory = "tests/java/stubs";
const stubSources = readdirSync(stubDirectory, { recursive: true })
  .filter((fileName) => fileName.endsWith(".java"))
  .map((fileName) => join(stubDirectory, fileName));
const productionSources = [
  "android/src/main/java/com/mobilenativebarcodegenerator/GalleryContextProvider.java",
  "android/src/main/java/com/mobilenativebarcodegenerator/MobileNativeBarcodeGeneratorPackage.java",
];
const testSources = [
  "android/src/test/java/com/mobilenativebarcodegenerator/JavaUnitTest.java",
];

mkdirSync(outputDirectory, { recursive: true });

const compilation = spawnSync(
  "javac",
  [
    "-Xlint:all",
    "-d",
    outputDirectory,
    ...stubSources,
    ...productionSources,
    ...testSources,
  ],
  { stdio: "inherit" },
);

if (compilation.error) {
  throw compilation.error;
}

if (compilation.status !== 0) {
  process.exitCode = compilation.status ?? 1;
} else {
  const execution = spawnSync(
    "java",
    ["-cp", outputDirectory, "com.mobilenativebarcodegenerator.JavaUnitTest"],
    { stdio: "inherit" },
  );

  if (execution.error) {
    throw execution.error;
  }

  process.exitCode = execution.status ?? 1;
}
