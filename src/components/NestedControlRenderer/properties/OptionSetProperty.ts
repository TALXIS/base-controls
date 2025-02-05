import { DataTypes, FieldValue } from "@talxis/client-libraries";
import { Property } from "./Property";
import { IOptionSetProperty } from "../../../interfaces";

export class OptionSetProperty extends Property {

    public getParameter(): IOptionSetProperty {
        let value = this.getValue();
        if(this.dataType === DataTypes.TwoOptions) {
            value = value === true;
        }
        const formattedValue = new FieldValue(value, this.dataType, this.attributeMetadata).getFormattedValue();
        return {
            raw: value ?? null,
            formatted: formattedValue ?? undefined,
            attributes: {
                ...this.attributeMetadata,
                Options: this.attributeMetadata?.OptionSet ?? []
            }
        }
    }
    
}