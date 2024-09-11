using System;
using System.Threading.Tasks;

public class MobileNativeBarcodeGeneratorWindows
{
    public async Task<string> GenerateBarcode(string value, int width, int height)
    {
        return await Task.FromResult(value + width + height + "barcode");
    }

    public async Task<string> GenerateQRCode(string value, int width, int height)
    {
        return await Task.FromResult(value + width + height + "qrcode");
    }

    public async Task<string> SaveQRCodeToGallery(string value, int width, int height, string fileName)
    {
        return await Task.FromResult(value + width + height + fileName + "saved qrcode");
    }

    public async Task<string> SaveBarcodeToGallery(string value, int width, int height, string fileName)
    {
        return await Task.FromResult(value + width + height + fileName + "saved barcode");
    }
}