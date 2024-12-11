import { Attribute, DataTypes } from "@talxis/client-libraries";
import { IOptionSet } from "../../../../../../OptionSet";
import { Control } from "./Control";
import { ITwoOptions } from "../../../../../../TwoOptions";
import { IMultiSelectOptionSet } from "../../../../../../MultiSelectOptionSet";

export class OptionSetControl extends Control {
    private _options: ComponentFramework.PropertyHelper.OptionMetadata[] = [];

    public async init(): Promise<boolean> {
        const entityAliasName = Attribute.GetLinkedEntityAlias(this._controlHandler.getColumn().name);
        const attributeName = Attribute.GetNameFromAlias(this._controlHandler.getColumn().name);
        let metadata: ComponentFramework.PropertyHelper.EntityMetadata | null = null;
        if (entityAliasName) {
            const linkedEntity = this._entityMetadata?.linking?.find(x => x.alias === entityAliasName);
            if (!linkedEntity) {
                throw new Error('Detected linked entity OptionSet but no linking was provided!');
            }
            metadata = await this._controlHandler.getParentContext().utils.getEntityMetadata(linkedEntity.name, [attributeName])
        }
        else if (this._entityMetadata?.entityName !== undefined) {
            metadata = await this._controlHandler.getParentContext().utils.getEntityMetadata(this._entityMetadata?.entityName)
        }
        if (metadata) {
            this._options = metadata.Attributes.get(attributeName).attributeDescriptor.OptionSet ?? [];
        }
        return true;
    }
    
    public getProps(): IOptionSet | ITwoOptions | IMultiSelectOptionSet {
        let value = this._controlHandler.getBindingValue();
        const validation = this._controlHandler.getValidationResult();
        if (this._controlHandler.getColumn().dataType === DataTypes.TwoOptions) {
            value = value === true;
        }
        return {
            context: this._controlHandler.getParentContext(),
            parameters: {
                value: {
                    raw: value ?? null,
                    error: validation?.error === false,
                    errorMessage: validation?.errorMessage ?? "",
                    attributes: {
                        Options: this._options
                    }
                }
            },
            onNotifyOutputChanged: (outputs: any) => this._onNotifyOutputChanged(outputs.value)
        }
    }

}


