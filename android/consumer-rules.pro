# GallerySaverAndroid.cpp resolves this method by its original name through JNI.
# Keep it in minified consumer apps so release builds can save generated images.
-keep class com.mobilenativebarcodegenerator.GalleryContextProvider {
  public static android.content.Context getApplicationContext();
}
