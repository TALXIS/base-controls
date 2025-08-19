import { OptionSetBase } from "./OptionSetBase";

export class OptionSet extends OptionSetBase {
    protected _getSelectedOptions(optionSet: ComponentFramework.PropertyHelper.OptionMetadata[]): ComponentFramework.PropertyHelper.OptionMetadata[] {
        const value: number = this.getValue();
        return optionSet.filter(option => option.Value == value);
    }
    
}