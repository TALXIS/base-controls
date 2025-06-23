import { Property } from "./Property";
import { IOptionSetProperty } from "../../../interfaces";

export class OptionSetProperty extends Property {

    public getParameter(): IOptionSetProperty {
        let value = this.getValue();
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