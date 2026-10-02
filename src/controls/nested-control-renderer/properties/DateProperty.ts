import { IDateTimeProperty } from "@interfaces";
import { Property } from "./Property";

export class DateProperty extends Property {
    public getParameter(): IDateTimeProperty {
        return {
            raw: this.getValue(),
            formatted: this.getFormattedValue(),
            attributes: this.attributeMetadata
        }
    }
}
