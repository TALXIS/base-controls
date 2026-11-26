import { DataTypes, IColumn, Sanitizer } from "@talxis/client-libraries";
import { IParameters } from "@pcf/interfaces";
import { IGridField } from "../../../runtime/fields";
import { IBinding } from "@fields/nested-control-renderer/interfaces";

export interface IBindingsParameters {
    /** The field the cell draws, where the cell is bound to one. */
    field: IGridField | undefined;
    /** The column the cell is in, where the provider has one for it. */
    column: IColumn | undefined;
    /** The cell's parameters: every plain value among them is bound as static. */
    parameters: IParameters;
}

/** What a nested control is bound to. */
export const getBindings = (parameters: IBindingsParameters): { [name: string]: IBinding } => {
    const { field, column } = parameters;
    const value = field?.getValue();
    const validity = field?.isValid();
    const bindings: { [name: string]: IBinding } = {
        'value': {
            isStatic: false,
            type: column?.dataType as any,
            value: column ? getControlValue(column, value) : value,
            formattedValue: field?.getFormattedValue() ?? null,
            error: validity?.error,
            errorMessage: validity?.errorMessage,
            onNotifyOutputChanged: newValue => field?.setValue(newValue),
            metadata: {
                onOverrideMetadata: () => column?.metadata
            }
        },
        'IsCellCustomizer': {
            isStatic: true,
            type: DataTypes.TwoOptions,
            value: true
        },
    };
    //a PCF mounted by the platform reads its manifest's inputs from these
    for (const [name, parameter] of Object.entries(parameters.parameters)) {
        if (name !== 'value' && isPlainValue(parameter.raw)) {
            bindings[name] = { isStatic: true, type: parameter.type!, value: parameter.raw };
        }
    }
    return bindings;
};

const isPlainValue = (value: unknown): boolean => value === null || ['string', 'number', 'boolean'].includes(typeof value);

/** The value in the shape PCF typings promise. */
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
