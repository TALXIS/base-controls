import { DataTypes } from "@talxis/client-libraries";
import { IOptionSetProperty } from "../../../../../../../interfaces";
import { Property } from "./Property";
import { FieldValue } from "../Component/FieldValue";

export class OptionSetProperty extends Property {

    public getParameter(): IOptionSetProperty {
        const validation = this.getValidationResult();
        let value = this.getValue();
        if(this.dataType === DataTypes.TwoOptions) {
            value = value === true;
        }
        const formattedValue = new FieldValue(value, this.dataType, this.attributeMetadata).getFormattedValue();
        return {
            raw: value ?? null,
            error: validation.error,
            type: this.dataType,
            formatted: formattedValue ?? undefined,
            errorMessage: validation.errorMessage,
            attributes: {
                Options: this.attributeMetadata?.OptionSet ?? []
            }
        }
    }
    
}