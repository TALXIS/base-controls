import dayjs from "dayjs";
import { IDateTimeProperty } from "../../../../../../../interfaces";
import { FieldValue } from "../Component/FieldValue";
import { Property } from "./Property";

export class DateProperty extends Property {
    public getParameter(): IDateTimeProperty {
        const value = this.getValue();
        const date = dayjs(value);
        const formattedValue = new FieldValue(value, this.dataType).getFormattedValue();
        const validation = this.getValidationResult();
        return {
            raw: date.isValid() ? date.toDate() : value,
            error: validation.error,
            errorMessage: validation.errorMessage,
            formatted: formattedValue ?? undefined,
            type: this.dataType,
            attributes: <any>this.attributeMetadata ?? {
                Behavior: 0,
                //TODO: default format
            }
        }
    }
}