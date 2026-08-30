import { beforeEach, describe, expect, it, vi } from "vitest";

const reactNative = vi.hoisted(() => ({
  platform: {
    OS: "ios",
    Version: 18 as string | number,
  },
  request: vi.fn<(permission: string) => Promise<string>>(),
  permission: "android.permission.WRITE_EXTERNAL_STORAGE",
  granted: "granted",
}));

vi.mock("react-native", () => ({
  Platform: reactNative.platform,
  PermissionsAndroid: {
    PERMISSIONS: {
      WRITE_EXTERNAL_STORAGE: reactNative.permission,
    },
    RESULTS: {
      GRANTED: reactNative.granted,
    },
    request: reactNative.request,
  },
}));

import { ensureGalleryPermission } from "../../src/internal/galleryPermission";

describe("ensureGalleryPermission", () => {
  beforeEach(() => {
    reactNative.platform.OS = "ios";
    reactNative.platform.Version = 18;
    reactNative.request.mockReset();
  });

  it("does not request Android permission on iOS", async () => {
    await expect(ensureGalleryPermission()).resolves.toBeUndefined();
    expect(reactNative.request).not.toHaveBeenCalled();
  });

  it("does not request permission on Android API 29 or newer", async () => {
    reactNative.platform.OS = "android";
    reactNative.platform.Version = "29";

    await expect(ensureGalleryPermission()).resolves.toBeUndefined();
    expect(reactNative.request).not.toHaveBeenCalled();
  });

  it("requests storage permission on Android API 28", async () => {
    reactNative.platform.OS = "android";
    reactNative.platform.Version = 28;
    reactNative.request.mockResolvedValue(reactNative.granted);

    await expect(ensureGalleryPermission()).resolves.toBeUndefined();
    expect(reactNative.request).toHaveBeenCalledWith(reactNative.permission);
  });

  it("rejects when storage permission is denied", async () => {
    reactNative.platform.OS = "android";
    reactNative.platform.Version = 28;
    reactNative.request.mockResolvedValue("denied");

    await expect(ensureGalleryPermission()).rejects.toThrow(
      "Permission to save images to the gallery was denied",
    );
  });
});
