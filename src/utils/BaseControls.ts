import { DataType } from "@talxis/client-libraries";

export type BaseControl =
    | 'TextField'
    | 'OptionSet'
    | 'MultiSelectOptionSet'
    | 'DateTime'
    | 'Decimal'
    | 'Duration'
    | 'GridCellRenderer'
    | 'Lookup'
    | 'TwoOptions'
    | 'GridCellRenderer'
    | 'Grid'
    | 'DatasetControl'
    | 'NestedControl'
    | 'GridColumnHeader'
    | 'Ribbon'
    | 'GridInlineRibbon';

export class BaseControls {
    public static get TextField(): 'TextField' {
        return 'TextField';
    }

    public static get OptionSet(): 'OptionSet' {
        return 'OptionSet';
    }

    public static get MultiSelectOptionSet(): 'MultiSelectOptionSet' {
        return 'MultiSelectOptionSet';
    }

    public static get DateTime(): 'DateTime' {
        return 'DateTime';
    }

    public static get Decimal(): 'Decimal' {
        return 'Decimal';
    }

    public static get Duration(): 'Duration' {
        return 'Duration';
    }

    public static get GridCellRenderer(): 'GridCellRenderer' {
        return 'GridCellRenderer';
    }

    public static get Lookup(): 'Lookup' {
        return 'Lookup';
    }
    
    public static get TwoOptions(): 'TwoOptions' {
        return 'TwoOptions';
    }
    public static get GridColumnHeader(): 'GridColumnHeader' {
        return 'GridColumnHeader';
    }
    public static get Ribbon(): 'Ribbon' {
        return 'Ribbon';
    }
    public static get GridInlineRibbon(): 'GridInlineRibbon' {
        return 'GridInlineRibbon';
    }

    public static GetControlNameForDataType(dataType: DataType) {
        switch(dataType) {
            case 'Currency':
            case 'Whole.None':
            case 'Decimal': {
                return BaseControls.Decimal;
            }
            case 'DateAndTime.DateAndTime':
            case 'DateAndTime.DateOnly': {
                return BaseControls.DateTime;
            }
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding':
            case 'Lookup.Simple': {
                return BaseControls.Lookup;
            }
            case 'OptionSet': {
                return BaseControls.OptionSet;
            }
            case 'MultiSelectPicklist': {
                return BaseControls.MultiSelectOptionSet;
            }
            case 'TwoOptions': {
                return BaseControls.TwoOptions;
            }
            case 'Whole.Duration': {
                return BaseControls.Duration;
            }
            default: {
                return BaseControls.TextField;
            }
        }
    }
    public static GetAll(): BaseControl[] {
        return [
            BaseControls.Decimal,
            BaseControls.DateTime,
            BaseControls.Lookup,
            BaseControls.OptionSet,
            BaseControls.MultiSelectOptionSet,
            BaseControls.TwoOptions,
            BaseControls.Duration,
            BaseControls.TextField,
            BaseControls.GridCellRenderer,
            BaseControls.GridColumnHeader,
            BaseControls.Ribbon,
            BaseControls.GridInlineRibbon
        ]
    }
    public static IsBaseControl(name: string) {
        return this.GetAll().includes(name as BaseControl);
    }
}