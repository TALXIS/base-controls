import { Property } from "./Property";

export abstract class OptionSetBase extends Property {

    public getColorfulOptionSet(): ComponentFramework.PropertyHelper.OptionMetadata[] | null {
        const optionSet = this.getModel().getValueAttributes().OptionSet;
        if (this._hasColors(optionSet)) {
            return this._getSelectedOptions(optionSet);
        }
        else {
            return null;
        }
    }

    protected abstract _getSelectedOptions(optionSet: ComponentFramework.PropertyHelper.OptionMetadata[]): ComponentFramework.PropertyHelper.OptionMetadata[];

    private _hasColors(optionSet: ComponentFramework.PropertyHelper.OptionMetadata[]): boolean {
        return optionSet.some(option => option.Color);
    }
}