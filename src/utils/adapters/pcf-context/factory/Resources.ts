import { notImplemented } from "./utils";

export class Resources implements ComponentFramework.Resources {
    public getResource(id: string, success: (data: string) => void, failure: () => void): void {
        void id;
        void success;
        void failure;
        notImplemented("resources.getResource");
    }

    public getString(id: string): string {
        void id;
        return notImplemented("resources.getString");
    }
}
