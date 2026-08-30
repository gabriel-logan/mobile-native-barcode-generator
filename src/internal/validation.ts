const MAX_BARCODE_LENGTH = 80;
const MAX_QR_CODE_LENGTH = 2500;
const MAX_IMAGE_DIMENSION = 4096;

function validateValue(value: string) {
  if (value.length === 0) {
    throw new Error("Value cannot be empty");
  }
}

function validateLength(value: string, maximumLength: number, label: string) {
  if (value.length > maximumLength) {
    throw new Error(
      `${label} value length must be less than ${maximumLength} characters`,
    );
  }
}

function validateDimension(value: number, label: "Width" | "Height") {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }

  if (value > MAX_IMAGE_DIMENSION) {
    throw new Error(`${label} must not exceed ${MAX_IMAGE_DIMENSION} pixels`);
  }
}

export function validateBarcodeInput(
  value: string,
  width: number,
  height: number,
) {
  validateValue(value);
  validateLength(value, MAX_BARCODE_LENGTH, "Barcode");
  validateDimension(width, "Width");
  validateDimension(height, "Height");
}

export function validateQRCodeInput(
  value: string,
  width: number,
  height: number,
) {
  validateValue(value);
  validateLength(value, MAX_QR_CODE_LENGTH, "QR code");
  validateDimension(width, "Width");
  validateDimension(height, "Height");
}

export function validateSaveInput(
  value: string,
  width: number,
  height: number,
) {
  validateValue(value);
  validateDimension(width, "Width");
  validateDimension(height, "Height");
}

export function validateFileName(fileName: string) {
  if (fileName.trim().length === 0) {
    throw new Error("Filename cannot be empty");
  }
}
