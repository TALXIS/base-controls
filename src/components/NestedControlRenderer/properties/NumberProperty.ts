import { FieldValue } from "@talxis/client-libraries";
import { IWholeNumberProperty } from "../../../interfaces";
import { Property } from "./Property";

export class NumberProperty extends Property {

    public getParameter(): IWholeNumberProperty {
        const value = this.getValue();
        const formattedValue = new FieldValue(value, this.dataType).getFormattedValue();
        return {
            raw: value,
            formatted: formattedValue ?? undefined,
            attributes: this.attributeMetadata
        }
    }
}