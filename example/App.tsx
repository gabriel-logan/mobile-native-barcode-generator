import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BarcodeView,
  generateBarcode,
  generateQRCode,
  QRCodeView,
  saveBarcodeToGallery,
  saveQRCodeToGallery,
} from "mobile-native-barcode-generator";

const BARCODE_WIDTH = 320;
const BARCODE_HEIGHT = 120;
const QR_CODE_SIZE = 220;

export default function App() {
  const [input, setInput] = useState("1234567890");
  const [value, setValue] = useState(input);
  const [generatedBarcode, setGeneratedBarcode] = useState<string>();
  const [generatedQRCode, setGeneratedQRCode] = useState<string>();
  const [componentError, setComponentError] = useState<string>();

  async function run(action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      Alert.alert(
        "Operation failed",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Barcode Generator</Text>
        <Text style={styles.description}>
          This app exercises every public API exposed by the library.
        </Text>

        <TextInput
          accessibilityLabel="Barcode value"
          autoCapitalize="none"
          onChangeText={setInput}
          onSubmitEditing={() => setValue(input)}
          placeholder="Value to encode"
          style={styles.input}
          value={input}
        />

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            setComponentError(undefined);
            setValue(input);
          }}
        >
          <Text style={styles.primaryButtonText}>Update components</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Components</Text>

        {/* `onGenerationError` keeps an empty or unencodable input from
            throwing during render and taking the screen down with it. */}
        <View style={styles.preview}>
          <BarcodeView
            testID="barcode-component"
            value={value}
            width={BARCODE_WIDTH}
            height={BARCODE_HEIGHT}
            onGenerationError={error => setComponentError(error.message)}
          />
        </View>

        <View style={styles.preview}>
          <QRCodeView
            testID="qr-code-component"
            value={value}
            width={QR_CODE_SIZE}
            height={QR_CODE_SIZE}
            onGenerationError={error => setComponentError(error.message)}
          />
        </View>

        {componentError !== undefined && (
          <Text style={styles.error}>{componentError}</Text>
        )}

        <Text style={styles.sectionTitle}>Functions</Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              run(async () => {
                setGeneratedBarcode(
                  await generateBarcode(value, BARCODE_WIDTH, BARCODE_HEIGHT),
                );
              })
            }
          >
            <Text style={styles.secondaryButtonText}>Generate barcode</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              run(async () => {
                setGeneratedQRCode(
                  await generateQRCode(value, QR_CODE_SIZE, QR_CODE_SIZE),
                );
              })
            }
          >
            <Text style={styles.secondaryButtonText}>Generate QR code</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              run(async () => {
                const uri = await saveBarcodeToGallery(
                  value,
                  BARCODE_WIDTH,
                  BARCODE_HEIGHT,
                  "example-barcode",
                );
                Alert.alert("Barcode saved", uri);
              })
            }
          >
            <Text style={styles.secondaryButtonText}>Save barcode</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              run(async () => {
                const uri = await saveQRCodeToGallery(
                  value,
                  QR_CODE_SIZE,
                  QR_CODE_SIZE,
                  "example-qr-code",
                );
                Alert.alert("QR code saved", uri);
              })
            }
          >
            <Text style={styles.secondaryButtonText}>Save QR code</Text>
          </Pressable>
        </View>

        {generatedBarcode !== undefined && (
          <View style={styles.preview}>
            <Image
              accessibilityLabel="Generated barcode"
              source={{ uri: generatedBarcode }}
              style={{ width: BARCODE_WIDTH, height: BARCODE_HEIGHT }}
            />
          </View>
        )}

        {generatedQRCode !== undefined && (
          <View style={styles.preview}>
            <Image
              accessibilityLabel="Generated QR code"
              source={{ uri: generatedQRCode }}
              style={{ width: QR_CODE_SIZE, height: QR_CODE_SIZE }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  content: {
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  title: {
    alignSelf: "stretch",
    color: "#111827",
    fontSize: 30,
    fontWeight: "700",
  },
  description: {
    alignSelf: "stretch",
    color: "#4b5563",
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    alignSelf: "stretch",
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#111827",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 10,
    padding: 14,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    alignSelf: "stretch",
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  error: {
    color: "#b00020",
    marginTop: 8,
    textAlign: "center",
  },
  preview: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    minHeight: 152,
    justifyContent: "center",
    overflow: "hidden",
    padding: 16,
  },
  actions: {
    alignSelf: "stretch",
    gap: 10,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
  },
  secondaryButtonText: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "600",
  },
});
