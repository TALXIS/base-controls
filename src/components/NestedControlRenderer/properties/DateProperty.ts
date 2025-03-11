import dayjs from "dayjs";
import { IDateTimeProperty } from "../../../interfaces";
import { Property } from "./Property";
import { FieldValue } from "@talxis/client-libraries";

export class DateProperty extends Property {
    public getParameter(): IDateTimeProperty {
        const value = this.getValue();
        const date = dayjs(value);
        const formattedValue = new FieldValue(value, this.dataType).getFormattedValue();
        return {
            raw: date.isValid() ? date.toDate() : value,
            formatted: formattedValue ?? undefined,
            attributes: <any>this.attributeMetadata ?? {
                Behavior: 0,
                //TODO: default format
            }
        }
    }
}