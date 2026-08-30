import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Image } from 'react-native';

jest.mock(
  'mobile-native-barcode-generator/dist/specs/NativeMobileNativeBarcodeGenerator',
  () => ({
    __esModule: true,
    default: {
      generateBarcode: jest.fn().mockResolvedValue('barcode-base64'),
      generateQRCode: jest.fn().mockResolvedValue('qr-code-base64'),
      saveBarcodeToGallery: jest.fn().mockResolvedValue('content://barcode'),
      saveQRCodeToGallery: jest.fn().mockResolvedValue('content://qr-code'),
    },
  }),
);

import {
  BarcodeView,
  generateBarcode,
  generateQRCode,
  QRCodeView,
  saveBarcodeToGallery,
  saveQRCodeToGallery,
} from 'mobile-native-barcode-generator';
import * as library from 'mobile-native-barcode-generator';

beforeEach(() => {
  jest.clearAllMocks();
});

test('exports the same six runtime APIs as the previous version', () => {
  expect(Object.keys(library).sort()).toEqual([
    'BarcodeView',
    'QRCodeView',
    'generateBarcode',
    'generateQRCode',
    'saveBarcodeToGallery',
    'saveQRCodeToGallery',
  ]);
});

test('keeps the legacy function contract', async () => {
  await expect(generateBarcode('123', 300, 100)).resolves.toBe(
    'data:image/png;base64,barcode-base64',
  );
  await expect(generateQRCode('hello', 200, 200)).resolves.toBe(
    'data:image/png;base64,qr-code-base64',
  );
  await expect(saveBarcodeToGallery('123', 300, 100, 'barcode')).resolves.toBe(
    'content://barcode',
  );
  await expect(saveQRCodeToGallery('hello', 200, 200, 'qr-code')).resolves.toBe(
    'content://qr-code',
  );
});

test('keeps both legacy component contracts', async () => {
  let barcode: ReactTestRenderer.ReactTestRenderer;
  let qrCode: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    barcode = ReactTestRenderer.create(
      <BarcodeView value="123" width={300} height={100} />,
    );
    qrCode = ReactTestRenderer.create(
      <QRCodeView value="hello" width={200} height={200} />,
    );
  });

  expect(barcode!.root.findByType(Image).props.source).toEqual({
    uri: 'data:image/png;base64,barcode-base64',
  });
  expect(qrCode!.root.findByType(Image).props.source).toEqual({
    uri: 'data:image/png;base64,qr-code-base64',
  });
});

test('rejects invalid input before calling native code', async () => {
  await expect(generateBarcode('', 300, 100)).rejects.toThrow(
    'Value cannot be empty',
  );
  await expect(generateBarcode('a'.repeat(81), 300, 100)).rejects.toThrow(
    'Barcode value length must be less than 80 characters',
  );
  await expect(generateQRCode('a'.repeat(2501), 200, 200)).rejects.toThrow(
    'QR code value length must be less than 2500 characters',
  );
  await expect(saveQRCodeToGallery('hello', 200, 200, '   ')).rejects.toThrow(
    'Filename cannot be empty',
  );
});

test('keeps legacy save functions free from generation length limits', async () => {
  await expect(
    saveBarcodeToGallery('a'.repeat(81), 300, 100, 'barcode'),
  ).resolves.toBe('content://barcode');
  await expect(
    saveQRCodeToGallery('a'.repeat(2501), 200, 200, 'qr-code'),
  ).resolves.toBe('content://qr-code');
});
