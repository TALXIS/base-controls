import { IWholeNumberProperty } from "../../../../../../../interfaces";
import { FieldValue } from "../Component/FieldValue";
import { Property } from "./Property";

export class NumberProperty extends Property {

    public getParameter(): IWholeNumberProperty {
        const value = this.getValue();
        const formattedValue = new FieldValue(value, this.dataType).getFormattedValue();
        const validation = this.getValidationResult();
        return {
            raw: value,
            error: validation.error,
            errorMessage: validation.errorMessage,
            formatted: formattedValue ?? undefined,
            type: this.dataType,
            attributes: this.attributeMetadata
        }
    }
}