import { render } from "@testing-library/react-native";

import { BarcodeView, QRCodeView, generateBarcode, generateQRCode } from "..";

jest.mock("react-native", () => ({
	NativeModules: {
		MobileNativeBarcodeGenerator: {
			generateQRCode: jest.fn().mockResolvedValue("mocked_base64_string"),
			generateBarcode: jest.fn().mockResolvedValue("mocked_base64_string"),
		},
	},
	Platform: {
		select: jest.fn().mockImplementation((obj) => obj.default),
		OS: "android",
	},

	Image: (props: any) => {
		return <div {...props} />;
	},
}));

describe("App", () => {
	// eslint-disable-next-line no-console
	const originalError = console.error;

	beforeAll(() => {
		// eslint-disable-next-line no-console
		console.error = jest.fn();
	});

	afterAll(() => {
		// eslint-disable-next-line no-console
		console.error = originalError;
	});

	describe("QRCode Tests", () => {
		describe("QRCodeView", () => {
			it("should render QRCodeView correctly", async () => {
				render(<QRCodeView value="test" width={100} height={100} />);
			});

			it("should throw an error if value is empty", () => {
				expect(() =>
					render(<QRCodeView value="" width={100} height={100} />),
				).toThrow("Value cannot be empty");
			});

			it("should throw an error if width is not a positive number", () => {
				expect(() =>
					render(<QRCodeView value="test" width={0} height={100} />),
				).toThrow("Width must be a positive number");

				expect(() =>
					render(<QRCodeView value="test" width={-1} height={100} />),
				).toThrow("Width must be a positive number");

				expect(() =>
					render(<QRCodeView value="test" width={"100" as any} height={100} />),
				).toThrow("Width must be a positive number");
			});

			it("should throw an error if height is not a positive number", () => {
				expect(() =>
					render(<QRCodeView value="test" width={100} height={0} />),
				).toThrow("Height must be a positive number");

				expect(() =>
					render(<QRCodeView value="test" width={100} height={-1} />),
				).toThrow("Height must be a positive number");

				expect(() =>
					render(<QRCodeView value="test" width={100} height={"100" as any} />),
				).toThrow("Height must be a positive number");
			});
		});

		describe("generateQRCode", () => {
			it("should generate a QR code", async () => {
				const result = await generateQRCode("test", 100, 100);
				expect(result).toBe("data:image/png;base64,mocked_base64_string");
			});

			it("should throw an error if value.lenght > 2500", async () => {
				await expect(
					async () => await generateQRCode("a".repeat(2501), 100, 100),
				).rejects.toThrow(
					"QR code value length must be less than 2500 characters",
				);
			});
		});
	});

	describe("Barcode Tests", () => {
		describe("BarcodeView", () => {
			it("should render BarcodeView correctly", async () => {
				render(<BarcodeView value="test" width={100} height={100} />);
			});

			it("should throw an error if value is empty", () => {
				expect(() =>
					render(<BarcodeView value="" width={100} height={100} />),
				).toThrow("Value cannot be empty");
			});

			it("should throw an error if width is not a positive number", () => {
				expect(() =>
					render(<BarcodeView value="test" width={0} height={100} />),
				).toThrow("Width must be a positive number");

				expect(() =>
					render(<BarcodeView value="test" width={-1} height={100} />),
				).toThrow("Width must be a positive number");

				expect(() =>
					render(
						<BarcodeView value="test" width={"100" as any} height={100} />,
					),
				).toThrow("Width must be a positive number");
			});

			it("should throw an error if height is not a positive number", () => {
				expect(() =>
					render(<BarcodeView value="test" width={100} height={0} />),
				).toThrow("Height must be a positive number");

				expect(() =>
					render(<BarcodeView value="test" width={100} height={-1} />),
				).toThrow("Height must be a positive number");

				expect(() =>
					render(
						<BarcodeView value="test" width={100} height={"100" as any} />,
					),
				).toThrow("Height must be a positive number");
			});
		});

		describe("generateBarcode", () => {
			it("should generate a QR code", async () => {
				const result = await generateBarcode("test", 100, 100);
				expect(result).toBe("data:image/png;base64,mocked_base64_string");
			});

			it("should throw an error if value.lenght > 80", async () => {
				await expect(
					async () => await generateBarcode("a".repeat(81), 100, 100),
				).rejects.toThrow(
					"Barcode value length must be less than 80 characters",
				);
			});
		});
	});
});
