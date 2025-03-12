import dayjs from "dayjs";
import { IDateTimeProperty } from "../../../interfaces";
import { Property } from "./Property";

export class DateProperty extends Property {
    public getParameter(): IDateTimeProperty {
        const value = this.getValue();
        const date = dayjs(value);
        return {
            raw: date.isValid() ? date.toDate() : value,
            formatted: this.getFormattedValue(),
            attributes: <any>this.attributeMetadata ?? {
                Behavior: 0,
                //TODO: default format
            }
        }
    }
}