package com.mobilenativebarcodegenerator;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;

public final class GalleryContextProvider extends ContentProvider {
  private static volatile Context applicationContext;

  @Override
  public boolean onCreate() {
    Context context = getContext();

    if (context != null) {
      applicationContext = context.getApplicationContext();
    }

    return applicationContext != null;
  }

  public static Context getApplicationContext() {
    if (applicationContext == null) {
      throw new IllegalStateException("Gallery context has not been initialized");
    }

    return applicationContext;
  }

  @Override
  public Cursor query(
      Uri uri,
      String[] projection,
      String selection,
      String[] selectionArgs,
      String sortOrder) {
    return null;
  }

  @Override
  public String getType(Uri uri) {
    return null;
  }

  @Override
  public Uri insert(Uri uri, ContentValues values) {
    throw new UnsupportedOperationException();
  }

  @Override
  public int delete(Uri uri, String selection, String[] selectionArgs) {
    throw new UnsupportedOperationException();
  }

  @Override
  public int update(
      Uri uri,
      ContentValues values,
      String selection,
      String[] selectionArgs) {
    throw new UnsupportedOperationException();
  }
}
