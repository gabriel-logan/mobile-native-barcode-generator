# Example

## Component

```js
import React from 'react';
import { BarcodeView, QRCodeView } from 'mobile-native-barcode-generator';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World!</Text>
      <View style={styles.view}>
        <QRCodeView value="Hello World!" width={300} height={300} />
        <BarcodeView value="Hello World!" width={300} height={100} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  view: {
    gap: 15,
  },
});
```

## Result