import { DataTypes, IColumn } from "@talxis/client-libraries";
import { IOptionSetRendererOption } from "./OptionSetRenderer";

/** The options a value has selected, for the data types that carry a set of them. */
export const getSelectedOptions = (value: any, column: IColumn): IOptionSetRendererOption[] => {
    const options: ComponentFramework.PropertyHelper.OptionMetadata[] = column.metadata?.OptionSet ?? [];
    const selected = ((): ComponentFramework.PropertyHelper.OptionMetadata[] => {
        switch (column.dataType) {
            case DataTypes.OptionSet: {
                return options.filter(option => `${option.Value}` === `${value}`);
            }
            case DataTypes.MultiSelectOptionSet: {
                const values = value == null ? [] : `${value}`.split(',');
                return options.filter(option => values.includes(`${option.Value}`));
            }
            case DataTypes.TwoOptions: {
                if (value == null) {
                    return [];
                }
                const isTrue = value === true || `${value}` === '1';
                return options.filter(option => (option.Value === 1) === isTrue);
            }
            default: {
                return [];
            }
        }
    })();
    return selected.map(option => ({ label: option.Label, value: option.Value, color: option.Color }));
};
