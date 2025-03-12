import { FieldValue } from "@talxis/client-libraries";
import { IWholeNumberProperty } from "../../../interfaces";
import { Property } from "./Property";

export class NumberProperty extends Property {

    public getParameter(): IWholeNumberProperty {
        const value = this.getValue();
        return {
            raw: value,
            formatted: this.getFormattedValue(),
            attributes: this.attributeMetadata
        }
    }
}