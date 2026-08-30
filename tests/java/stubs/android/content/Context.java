package android.content;

public class Context {
  private final Context applicationContext;

  public Context() {
    applicationContext = this;
  }

  public Context(Context applicationContext) {
    this.applicationContext = applicationContext;
  }

  public Context getApplicationContext() {
    return applicationContext;
  }
}
