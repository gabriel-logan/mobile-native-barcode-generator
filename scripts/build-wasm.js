/**
 * Builds the WebAssembly artifact used by the `.web` implementation of the
 * module out of the same C++ core the Android and iOS turbo modules compile.
 *
 * Everything in `wasm/` is generated — the module and its TypeScript
 * declaration — so the whole directory is ignored by git. `prepack` regenerates
 * it before publishing and `pnpm test` before running the suite. Run this
 * script once after cloning, and again whenever anything under `cpp/core` or
 * `cpp/wasm` changes.
 *
 * It uses `emcmake` from the local Emscripten SDK when one is on the PATH and
 * otherwise falls back to the official `emscripten/emsdk` Docker image.
 */

const { spawnSync } = require("node:child_process");
const { copyFileSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const buildDir = "build/wasm";
const outputDir = path.join(projectRoot, "wasm");
const artifacts = ["mnbg-wasm.js", "mnbg-wasm.d.ts"];
// Pinned so that every machine and CI produce the same artifact.
const emscriptenVersion = "6.0.8";
const dockerImage = `emscripten/emsdk:${emscriptenVersion}`;

function hasExecutable(command) {
  return spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0;
}

function run(command, args) {
  console.log(`> ${command} ${args.join(" ")}`);

  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const cmakeArgs = [
  "cmake",
  "-S",
  ".",
  "-B",
  buildDir,
  "-DCMAKE_BUILD_TYPE=Release",
];
const buildArgs = ["cmake", "--build", buildDir, "--target", "mnbg_wasm"];

if (hasExecutable("emcmake")) {
  run("emcmake", cmakeArgs);
  run(buildArgs[0], buildArgs.slice(1));
} else if (hasExecutable("docker")) {
  console.log(`emcmake not found on PATH, building with ${dockerImage}`);

  const docker = (args) => [
    "run",
    "--rm",
    "-u",
    `${process.getuid()}:${process.getgid()}`,
    "-v",
    `${projectRoot}:/src`,
    "-w",
    "/src",
    dockerImage,
    ...args,
  ];

  run("docker", docker(["emcmake", ...cmakeArgs]));
  run("docker", docker(buildArgs));
} else {
  console.error(
    "Neither emcmake nor docker is available. Install the Emscripten SDK " +
      "(https://emscripten.org/docs/getting_started/downloads.html) or Docker " +
      "and try again.",
  );
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

for (const artifact of artifacts) {
  copyFileSync(
    path.join(projectRoot, buildDir, artifact),
    path.join(outputDir, artifact),
  );

  console.log(`Wrote ${path.join("wasm", artifact)}`);
}
