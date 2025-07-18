import { OptionSetBase } from "./OptionSetBase";

export class MultiSelectOptionSet extends OptionSetBase {

    protected _getSelectedOptions(optionSet: ComponentFramework.PropertyHelper.OptionMetadata[]): ComponentFramework.PropertyHelper.OptionMetadata[] {
        const values: number[] = this.getValue();
        return optionSet.filter(option => values.includes(option.Value));
    }
}