import { DataTypes, IColumn, ICustomColumnControl, IRecord, Sanitizer } from "@talxis/client-libraries";
import { IBinding } from "@components/NestedControlRenderer/interfaces";

export interface IBindingsParameters {
    record: IRecord;
    column: IColumn;
    /** The control the bindings are for: whatever it declared itself is bound as static. */
    control: ICustomColumnControl;
    /** What the cell holds, and what it reads as - both already through the field hooks. */
    value: any;
    formattedValue: string | null;
    enableNavigation: boolean;
    onNotifyOutputChanged: (value: any) => void;
}

/** What a nested control is bound to: the cell's value, what the grid tells every control, and its own. */
export const getBindings = (parameters: IBindingsParameters): { [name: string]: IBinding } => {
    const { record, column, control, formattedValue, enableNavigation, onNotifyOutputChanged } = parameters;
    const columnInfo = record.getColumnInfo(column.name);
    const bindings: { [name: string]: IBinding } = {
        'value': {
            isStatic: false,
            type: column.dataType as any,
            value: getControlValue(column, parameters.value),
            formattedValue: formattedValue,
            error: columnInfo.error,
            errorMessage: columnInfo.errorMessage,
            onNotifyOutputChanged: onNotifyOutputChanged,
            metadata: {
                onOverrideMetadata: () => column.metadata
            }
        },
        'IsCellCustomizer': {
            isStatic: true,
            type: DataTypes.TwoOptions,
            value: true
        },
        EnableNavigation: {
            isStatic: true,
            type: DataTypes.TwoOptions,
            value: enableNavigation
        }
    };
    if (control.bindings) {
        Object.entries(control.bindings).map(([name, binding]) => {
            bindings[name] = {
                isStatic: true,
                type: binding.type!,
                value: binding.value
            }
        })
    }
    return bindings;
};

/** The value in the shape PCF typings promise, which is not always the shape a record holds it in. */
const getControlValue = (column: IColumn, value: any): any => {
    switch (column.dataType) {
        //getValue always returns string for TwoOptions
        case 'TwoOptions': {
            if (typeof value === 'string') {
                return value == '1' ? true : false;
            }
            return value;
        }
        //getValue always returns string for OptionSet
        case 'OptionSet': {
            return value ? parseInt(value) : null;
        }
        case 'MultiSelectPicklist': {
            return value ? value.split(',').map((x: string) => parseInt(x)) : null;
        }
        case 'Lookup.Simple':
        case 'Lookup.Customer':
        case 'Lookup.Owner':
        case 'Lookup.Regarding': {
            //our implementation returns array, Power Apps returns object
            const references = value && !Array.isArray(value) ? [value] : value;
            return references?.map((x: ComponentFramework.EntityReference) => Sanitizer.Lookup.getLookupValue(x));
        }
        default: {
            return value;
        }
    }
};
