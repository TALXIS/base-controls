import { FieldValue } from "@talxis/client-libraries";
import { Property } from "./Property";
import { IFileProperty } from "../../../interfaces";

export class FileProperty extends Property {
    public getParameter(): IFileProperty {
        const value = this.getValue();
        const formattedValue = new FieldValue(value, this.dataType).getFormattedValue();
        return {
            raw: value,
            formatted: formattedValue ?? ''
        }
    }
}