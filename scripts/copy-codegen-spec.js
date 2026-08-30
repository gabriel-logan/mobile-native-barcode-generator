const { copyFileSync, mkdirSync } = require("node:fs");

mkdirSync("types/codegen", { recursive: true });
copyFileSync(
  "src/specs/NativeMobileNativeBarcodeGenerator.ts",
  "types/codegen/NativeMobileNativeBarcodeGenerator.ts",
);
