import { DataTypes } from "@talxis/client-libraries";
import { IOptionSetProperty } from "../../../../../../../interfaces";
import { Property } from "./Property";

export class OptionSetProperty extends Property {
    private _metadata: ComponentFramework.PropertyHelper.EntityMetadata | null = null;
    private _options: ComponentFramework.PropertyHelper.OptionMetadata[] = [];
    public async init(): Promise<boolean> {
        if(!this.metadata) {
            return true;
        }
        this._metadata = await this.parentPcfContext.utils.getEntityMetadata(this.metadata.enitityName, [this.metadata.attributeName]);
        this._options = this._metadata.Attributes.get(this.metadata.attributeName).attributeDescriptor.OptionSet ?? [];
        return true;
    }
    
    public getParameter(): IOptionSetProperty {
        const validation = this.getValidationResult();
        let value = this.getValue();
        if(this.dataType === DataTypes.TwoOptions) {
            value = value === true;
        }
        
        return {
            raw: value ?? null,
            error: validation.error,
            errorMessage: validation.errorMessage,
            attributes: {
                Options: this._options
            }
        }
    }
    
}