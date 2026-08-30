import { describe, expect, it } from "vitest";

import { ensureGalleryPermission } from "../../src/internal/galleryPermission.web";

describe("web gallery permission", () => {
  it("resolves without touching react-native", async () => {
    await expect(ensureGalleryPermission()).resolves.toBeUndefined();
  });
});
