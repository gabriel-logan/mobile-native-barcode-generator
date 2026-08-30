import { PermissionsAndroid, Platform } from "react-native";

export async function ensureGalleryPermission() {
  if (Platform.OS !== "android" || Number(Platform.Version) >= 29) {
    return;
  }

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const result = await PermissionsAndroid.request(permission);

  if (result !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error("Permission to save images to the gallery was denied");
  }
}
