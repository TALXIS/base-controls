import { NestedControlRenderer } from "@components/NestedControlRenderer";
import { IControlProps } from "../Control";
import { useField, useForm } from "@components/Form/hooks";
import { BaseControls, usePcfContext } from "@utils";
import { IColumn } from "@talxis/client-libraries";
import { Sanitizer } from "@talxis/client-libraries";

const getControlValue = (column: IColumn, value: any): any => {
    switch (column.dataType) {
        case "TwoOptions": {
            if (typeof value === "string") {
                return value === "1";
            }
            return value;
        }
        case "OptionSet": {
            return value ? parseInt(value, 10) : null;
        }
        case "MultiSelectPicklist": {
            return value ? value.split(",").map((item: string) => parseInt(item, 10)) : null;
        }
        case "Lookup.Simple":
        case "Lookup.Customer":
        case "Lookup.Owner":
        case "Lookup.Regarding": {
            const lookupValue = value && !Array.isArray(value) ? [value] : value;
            return lookupValue?.map((item: ComponentFramework.EntityReference) => Sanitizer.Lookup.getLookupValue(item));
        }
        default: {
            return value;
        }
    }
}

export const ControlRenderer = (props: IControlProps) => {
    const { disabled = false } = props;
    //bound only!!!
    const field = useField()!;
    const form = useForm();
    const column = field.getColumn();
    const context = usePcfContext();
    const validationResult = form.saveOperationPerformed ? field.isValid() : null;

    const onNotifyOutputChanged = (outputs: any) => {
        field.setValue(outputs.value);
    }

    return <NestedControlRenderer
        context={context}
        parameters={{
            ControlName: BaseControls.GetControlNameForDataType(column.dataType),
            ControlStates: {
                isControlDisabled: disabled
            },
            Bindings: {
                value: {
                    type: column.dataType,
                    value: getControlValue(column, field.getValue()),
                    formattedValue: field.getFormattedValue(),
                    isStatic: false,
                    metadata: {
                        onOverrideMetadata: (metadata) => {
                            return column.metadata;
                        }
                    },
                    error: validationResult?.error,
                    errorMessage: validationResult?.errorMessage
                }
            }
        }}
        onNotifyOutputChanged={onNotifyOutputChanged}
    />
}