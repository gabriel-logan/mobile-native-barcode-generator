import { QRCodeView } from 'mobile-native-barcode-generator';
import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';

export default function App() {
  const [value, setValue] = useState<string>('');
  const [barcodeValue, setBarcodeValue] = useState<string>('');

  return (
    <View style={styles.container}>
      <Text>Result: </Text>
      {barcodeValue && (
        <QRCodeView value={barcodeValue} width={250} height={250} />
      )}
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Type Here"
      />
      <Button title="Generate QR Code" onPress={() => setBarcodeValue(value)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
