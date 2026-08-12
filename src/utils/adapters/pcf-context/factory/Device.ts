import { notImplemented } from "./utils";

export class Device implements ComponentFramework.Device {
    public captureAudio(): Promise<ComponentFramework.FileObject> {
        return Promise.reject(notImplemented("device.captureAudio"));
    }

    public captureImage(options?: ComponentFramework.DeviceApi.CaptureImageOptions): Promise<ComponentFramework.FileObject> {
        void options;
        return Promise.reject(notImplemented("device.captureImage"));
    }

    public captureVideo(): Promise<ComponentFramework.FileObject> {
        return Promise.reject(notImplemented("device.captureVideo"));
    }

    public getBarcodeValue(): Promise<string> {
        return Promise.reject(notImplemented("device.getBarcodeValue"));
    }

    public getCurrentPosition(): Promise<ComponentFramework.DeviceApi.Position> {
        return Promise.reject(notImplemented("device.getCurrentPosition"));
    }

    public pickFile(options?: ComponentFramework.DeviceApi.PickFileOptions): Promise<ComponentFramework.FileObject[]> {
        void options;
        return Promise.reject(notImplemented("device.pickFile"));
    }
}
