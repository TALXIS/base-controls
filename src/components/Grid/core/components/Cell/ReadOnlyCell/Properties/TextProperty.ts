import { IStringProperty } from "../../../../../../../interfaces";
import { Property } from "./Property";

export class TextProperty extends Property {
    public async init(): Promise<boolean> {
        return true;
    }
    public getParameter(): IStringProperty {
        const value = this.getValue();
        const validation = this.getValidationResult();
        return {
            raw: value,
            error: validation.error,
            errorMessage: validation.errorMessage,
            formatted: value,
            type: this.dataType,
        }
    }
}