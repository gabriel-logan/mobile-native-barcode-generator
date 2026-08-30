/**
 * Browsers gate downloads themselves and `PermissionsAndroid` does not exist in
 * react-native-web, so there is nothing to request up front.
 */
export async function ensureGalleryPermission() {}
