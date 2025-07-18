import { OptionSetBase } from "./OptionSetBase";

export class TwoOptions extends OptionSetBase {
    
    protected _getSelectedOptions(optionSet: ComponentFramework.PropertyHelper.OptionMetadata[]): ComponentFramework.PropertyHelper.OptionMetadata[] {
        const value: boolean = this.getValue();
        return optionSet.filter(option => option.Value == (value ? 1 : 0));
    }
}