/**
 * Declaration for `mnbg-wasm.js`, the Emscripten build of the shared C++ core
 * (see `scripts/build-wasm.js`). The module itself is generated and ignored by
 * git; this file is source, because `tsc` needs it to compile the web module
 * and requiring an Emscripten toolchain just to type-check would be absurd.
 *
 * Keep it in step with the bindings in `cpp/wasm/WasmBindings.cpp`.
 */

/**
 * Result of a generation call. Exactly one of the two fields is set — the
 * bindings report failures as data rather than letting a C++ exception unwind
 * into JavaScript, where its message would be lost.
 */
export interface MnbgWasmResult {
  value?: string;
  error?: string;
}

export interface MnbgWasmModule {
  generateBarcodeBase64(
    value: string,
    width: number,
    height: number,
  ): MnbgWasmResult;

  generateQRCodeBase64(
    value: string,
    width: number,
    height: number,
  ): MnbgWasmResult;
}

declare const createMnbgWasmModule: () => Promise<MnbgWasmModule>;

export default createMnbgWasmModule;
