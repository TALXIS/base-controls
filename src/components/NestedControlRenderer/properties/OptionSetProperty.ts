import { DataTypes, FieldValue } from "@talxis/client-libraries";
import { Property } from "./Property";
import { IOptionSetProperty } from "../../../interfaces";

export class OptionSetProperty extends Property {

    public getParameter(): IOptionSetProperty {
        let value = this.getValue();
        if(this.dataType === DataTypes.TwoOptions) {
            value = value === true;
        }
        return {
            raw: value ?? null,
            formatted: this.getFormattedValue(),
            attributes: {
                ...this.attributeMetadata,
                Options: this.attributeMetadata?.OptionSet ?? []
            }
        }
    }
    
}