import { IStringProperty } from "../../../interfaces";
import { Property } from "./Property";

export class TextProperty extends Property {
    public getParameter(): IStringProperty {
        const value = this.getValue();
        return {
            raw: value,
            formatted: value,
            attributes: this.attributeMetadata
        }
    }
}