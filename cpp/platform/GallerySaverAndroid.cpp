#include "GallerySaver.h"

#include <fbjni/fbjni.h>

#include <algorithm>
#include <cstdint>
#include <stdexcept>
#include <string>
#include <vector>

namespace mnbg {
namespace {

class LocalReference final {
 public:
  LocalReference(JNIEnv* environment, jobject value)
      : environment_(environment), value_(value) {}

  LocalReference(const LocalReference&) = delete;
  LocalReference& operator=(const LocalReference&) = delete;

  LocalReference(LocalReference&& other) noexcept
      : environment_(other.environment_), value_(other.value_) {
    other.value_ = nullptr;
  }

  ~LocalReference() {
    if (value_ != nullptr) {
      environment_->DeleteLocalRef(value_);
    }
  }

  template <typename T>
  T as() const {
    return static_cast<T>(value_);
  }

  explicit operator bool() const noexcept {
    return value_ != nullptr;
  }

 private:
  JNIEnv* environment_;
  jobject value_;
};

void throwIfJavaException(JNIEnv* environment, const char* operation) {
  if (environment->ExceptionCheck() == JNI_FALSE) {
    return;
  }

  environment->ExceptionClear();
  throw std::runtime_error(
      std::string("Android gallery operation failed while ") + operation);
}

jmethodID requireMethod(
    JNIEnv* environment,
    jclass type,
    const char* name,
    const char* signature,
    bool isStatic = false) {
  const jmethodID method = isStatic
      ? environment->GetStaticMethodID(type, name, signature)
      : environment->GetMethodID(type, name, signature);
  throwIfJavaException(environment, "resolving a Java method");

  if (method == nullptr) {
    throw std::runtime_error(std::string("Android method was not found: ") + name);
  }

  return method;
}

jclass requireClass(JNIEnv* environment, const char* name) {
  const jclass type = environment->FindClass(name);
  throwIfJavaException(environment, "resolving a Java class");

  if (type == nullptr) {
    throw std::runtime_error(std::string("Android class was not found: ") + name);
  }

  return type;
}

LocalReference makeString(JNIEnv* environment, const std::string& value) {
  return LocalReference(environment, environment->NewStringUTF(value.c_str()));
}

std::string normalizedFileName(std::string fileName) {
  std::replace(fileName.begin(), fileName.end(), '/', '_');
  std::replace(fileName.begin(), fileName.end(), '\\', '_');

  if (fileName.size() < 4 || fileName.substr(fileName.size() - 4) != ".png") {
    fileName += ".png";
  }

  return fileName;
}

void putString(
    JNIEnv* environment,
    jobject values,
    jmethodID putMethod,
    const std::string& key,
    const std::string& value) {
  const LocalReference keyString = makeString(environment, key);
  const LocalReference valueString = makeString(environment, value);
  environment->CallVoidMethod(
      values, putMethod, keyString.as<jstring>(), valueString.as<jstring>());
  throwIfJavaException(environment, "preparing image metadata");
}

void putInteger(
    JNIEnv* environment,
    jobject values,
    jmethodID putMethod,
    const std::string& key,
    int value) {
  const LocalReference keyString = makeString(environment, key);
  const jclass integerClass = requireClass(environment, "java/lang/Integer");
  const LocalReference integerClassReference(environment, integerClass);
  const jmethodID valueOf = requireMethod(
      environment, integerClass, "valueOf", "(I)Ljava/lang/Integer;", true);
  const LocalReference integerValue(
      environment,
      environment->CallStaticObjectMethod(integerClass, valueOf, value));
  throwIfJavaException(environment, "preparing numeric image metadata");

  environment->CallVoidMethod(
      values, putMethod, keyString.as<jstring>(), integerValue.as<jobject>());
  throwIfJavaException(environment, "preparing numeric image metadata");
}

int androidSdkVersion(JNIEnv* environment) {
  const jclass versionClass = requireClass(environment, "android/os/Build$VERSION");
  const LocalReference versionClassReference(environment, versionClass);
  const jfieldID sdkField =
      environment->GetStaticFieldID(versionClass, "SDK_INT", "I");
  throwIfJavaException(environment, "reading the Android SDK version");

  return environment->GetStaticIntField(versionClass, sdkField);
}

LocalReference applicationContext(JNIEnv* environment) {
  const jclass providerClass = requireClass(
      environment,
      "com/mobilenativebarcodegenerator/GalleryContextProvider");
  const LocalReference providerClassReference(environment, providerClass);
  const jmethodID getContext = requireMethod(
      environment,
      providerClass,
      "getApplicationContext",
      "()Landroid/content/Context;",
      true);
  LocalReference context(
      environment,
      environment->CallStaticObjectMethod(providerClass, getContext));
  throwIfJavaException(environment, "obtaining the Android application context");

  if (!context) {
    throw std::runtime_error("Android application context is unavailable");
  }

  return context;
}

std::string uriToString(JNIEnv* environment, jobject uri) {
  const jclass uriClass = requireClass(environment, "android/net/Uri");
  const LocalReference uriClassReference(environment, uriClass);
  const jmethodID toString =
      requireMethod(environment, uriClass, "toString", "()Ljava/lang/String;");
  const LocalReference uriString(
      environment, environment->CallObjectMethod(uri, toString));
  throwIfJavaException(environment, "reading the saved image URI");

  const auto value = uriString.as<jstring>();
  const char* characters = environment->GetStringUTFChars(value, nullptr);
  throwIfJavaException(environment, "reading the saved image URI");
  const std::string result(characters);
  environment->ReleaseStringUTFChars(value, characters);
  return result;
}

}  // namespace

std::string savePngToGallery(
    const std::vector<std::uint8_t>& png,
    const std::string& requestedFileName) {
  JNIEnv* environment = facebook::jni::Environment::current();

  const LocalReference context = applicationContext(environment);
  const jclass contextClass = requireClass(environment, "android/content/Context");
  const LocalReference contextClassReference(environment, contextClass);
  const jmethodID getResolver = requireMethod(
      environment,
      contextClass,
      "getContentResolver",
      "()Landroid/content/ContentResolver;");
  const LocalReference resolver(
      environment,
      environment->CallObjectMethod(context.as<jobject>(), getResolver));
  throwIfJavaException(environment, "obtaining Android ContentResolver");

  const jclass valuesClass = requireClass(environment, "android/content/ContentValues");
  const LocalReference valuesClassReference(environment, valuesClass);
  const jmethodID valuesConstructor =
      requireMethod(environment, valuesClass, "<init>", "()V");
  const jmethodID putStringMethod = requireMethod(
      environment,
      valuesClass,
      "put",
      "(Ljava/lang/String;Ljava/lang/String;)V");
  const jmethodID putIntegerMethod = requireMethod(
      environment,
      valuesClass,
      "put",
      "(Ljava/lang/String;Ljava/lang/Integer;)V");
  const LocalReference values(
      environment,
      environment->NewObject(valuesClass, valuesConstructor));
  throwIfJavaException(environment, "creating image metadata");

  const std::string fileName = normalizedFileName(requestedFileName);
  putString(
      environment, values.as<jobject>(), putStringMethod, "_display_name", fileName);
  putString(
      environment, values.as<jobject>(), putStringMethod, "mime_type", "image/png");

  const int sdkVersion = androidSdkVersion(environment);

  if (sdkVersion >= 29) {
    putString(
        environment,
        values.as<jobject>(),
        putStringMethod,
        "relative_path",
        "Pictures");
    putInteger(
        environment, values.as<jobject>(), putIntegerMethod, "is_pending", 1);
  } else {
    putString(
        environment,
        values.as<jobject>(),
        putStringMethod,
        "_data",
        "/sdcard/Pictures/" + fileName);
  }

  const jclass mediaClass =
      requireClass(environment, "android/provider/MediaStore$Images$Media");
  const LocalReference mediaClassReference(environment, mediaClass);
  const jfieldID externalUriField = environment->GetStaticFieldID(
      mediaClass, "EXTERNAL_CONTENT_URI", "Landroid/net/Uri;");
  throwIfJavaException(environment, "resolving the external image collection");
  const LocalReference collection(
      environment,
      environment->GetStaticObjectField(mediaClass, externalUriField));

  const jclass resolverClass =
      requireClass(environment, "android/content/ContentResolver");
  const LocalReference resolverClassReference(environment, resolverClass);
  const jmethodID insertMethod = requireMethod(
      environment,
      resolverClass,
      "insert",
      "(Landroid/net/Uri;Landroid/content/ContentValues;)Landroid/net/Uri;");
  const LocalReference uri(
      environment,
      environment->CallObjectMethod(
          resolver.as<jobject>(),
          insertMethod,
          collection.as<jobject>(),
          values.as<jobject>()));
  throwIfJavaException(environment, "creating the gallery image");

  if (!uri) {
    throw std::runtime_error("Android MediaStore did not create an image URI");
  }

  try {
    const jmethodID openStream = requireMethod(
        environment,
        resolverClass,
        "openOutputStream",
        "(Landroid/net/Uri;)Ljava/io/OutputStream;");
    const LocalReference stream(
        environment,
        environment->CallObjectMethod(
            resolver.as<jobject>(), openStream, uri.as<jobject>()));
    throwIfJavaException(environment, "opening the gallery image");

    if (!stream) {
      throw std::runtime_error("Android MediaStore did not open an output stream");
    }

    const LocalReference bytes(
        environment,
        environment->NewByteArray(static_cast<jsize>(png.size())));
    environment->SetByteArrayRegion(
        bytes.as<jbyteArray>(),
        0,
        static_cast<jsize>(png.size()),
        reinterpret_cast<const jbyte*>(png.data()));
    throwIfJavaException(environment, "copying the PNG data");

    const jclass streamClass = requireClass(environment, "java/io/OutputStream");
    const LocalReference streamClassReference(environment, streamClass);
    const jmethodID writeMethod =
        requireMethod(environment, streamClass, "write", "([B)V");
    const jmethodID flushMethod =
        requireMethod(environment, streamClass, "flush", "()V");
    const jmethodID closeMethod =
        requireMethod(environment, streamClass, "close", "()V");

    environment->CallVoidMethod(
        stream.as<jobject>(), writeMethod, bytes.as<jbyteArray>());
    environment->CallVoidMethod(stream.as<jobject>(), flushMethod);
    environment->CallVoidMethod(stream.as<jobject>(), closeMethod);
    throwIfJavaException(environment, "writing the PNG to the gallery");

    if (sdkVersion >= 29) {
      const LocalReference completedValues(
          environment,
          environment->NewObject(valuesClass, valuesConstructor));
      putInteger(
          environment,
          completedValues.as<jobject>(),
          putIntegerMethod,
          "is_pending",
          0);

      const jmethodID updateMethod = requireMethod(
          environment,
          resolverClass,
          "update",
          "(Landroid/net/Uri;Landroid/content/ContentValues;Ljava/lang/String;[Ljava/lang/String;)I");
      environment->CallIntMethod(
          resolver.as<jobject>(),
          updateMethod,
          uri.as<jobject>(),
          completedValues.as<jobject>(),
          nullptr,
          nullptr);
      throwIfJavaException(environment, "publishing the gallery image");
    }
  } catch (...) {
    const jmethodID deleteMethod = requireMethod(
        environment,
        resolverClass,
        "delete",
        "(Landroid/net/Uri;Ljava/lang/String;[Ljava/lang/String;)I");
    environment->CallIntMethod(
        resolver.as<jobject>(),
        deleteMethod,
        uri.as<jobject>(),
        nullptr,
        nullptr);
    environment->ExceptionClear();
    throw;
  }

  return uriToString(environment, uri.as<jobject>());
}

}  // namespace mnbg
