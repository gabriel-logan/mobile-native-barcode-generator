package android.content;

import android.database.Cursor;
import android.net.Uri;

public abstract class ContentProvider {
  private Context context;

  public final Context getContext() {
    return context;
  }

  public final void setContext(Context context) {
    this.context = context;
  }

  public abstract boolean onCreate();

  public abstract Cursor query(
      Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder);

  public abstract String getType(Uri uri);

  public abstract Uri insert(Uri uri, ContentValues values);

  public abstract int delete(Uri uri, String selection, String[] selectionArgs);

  public abstract int update(
      Uri uri, ContentValues values, String selection, String[] selectionArgs);
}
