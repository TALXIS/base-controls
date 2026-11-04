import { Property } from "./Property";
import { IFileProperty } from "@pcf/interfaces";

export class FileProperty extends Property {
    public getParameter(): IFileProperty {
        const value = this.getValue();
        return {
            raw: value,
            formatted: this.getFormattedValue()
        }
    }
}