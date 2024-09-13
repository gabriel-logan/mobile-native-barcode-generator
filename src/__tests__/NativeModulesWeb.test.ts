import MobileNativeBarcodeGenerator from "../MobileNativeBarcodeGenerator";
import MobileNativeBarcodeGeneratorWeb from "../web/MobileNativeBarcodeGeneratorWeb";

jest.mock("react-native", () => ({
	Platform: {
		select: jest.fn().mockImplementation((obj) => obj.default),
		OS: "web",
	},
}));

describe("NativeModulesWeb", () => {
	it("should create an instance of MobileNativeBarcodeGeneratorWeb if platform is web", () => {
		expect(MobileNativeBarcodeGenerator).toBeInstanceOf(
			MobileNativeBarcodeGeneratorWeb,
		);
	});
});
